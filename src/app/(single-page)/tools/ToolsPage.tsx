'use client'

import { LazyImage } from '@notion-x/src/components/lazy-image'
import FiSearch from '@notion-x/src/icons/FiSearch'
import IoCloseCircle from '@notion-x/src/icons/IoCloseCircle'
import { makeSlugText } from '@notion-x/src/lib/helpers'
import { defaultMapImageUrl } from '@notion-x/src/lib/utils'
import cn from 'classnames'
import Fuse from 'fuse.js'
import { ChangeEvent, useRef, useState } from 'react'

import { Tool } from '../../../interface'
import PiToolboxDuotone from '../../icons/PiToolboxDuotone'

export default function ToolsPage(props: { tools: Tool[]; tags: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchResult, setSearchResult] = useState<Tool[]>(props.tools)
  const [query, setQuery] = useState('')
  const [tagsToShow, setTagsToShow] = useState<string[]>([])

  const toggleTypeToShow = (tag: string) => {
    if (tagsToShow.includes(tag)) {
      setTagsToShow(tagsToShow.filter(item => item !== tag))
    } else {
      setTagsToShow([...tagsToShow, tag])
    }
  }

  const toolsToShow = searchResult.filter(
    tool => tagsToShow.every(type => tool.tag.includes(type)) || tagsToShow.length === 0
  )

  const fuseOptions = {
    includeScore: false,
    keys: ['name', 'description', 'tag']
  }

  const fuse = new Fuse(props.tools, fuseOptions)

  function handleOnchangeInput(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    setQuery(value)
    if (value.length) {
      const result = fuse.search(value)
      setSearchResult(result.map(item => item.item))
    } else {
      setSearchResult(props.tools)
    }
  }

  function clearQuery() {
    setQuery('')
    setSearchResult(props.tools)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tags */}
      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-center sm:justify-start">
        <div className="text-slate-600 whitespace-nowrap">Show tools for both?</div>
        <div className="flex gap-2 flex-wrap">
          {props.tags.map(tag => (
            <button
              onClick={() => toggleTypeToShow(tag)}
              key={makeSlugText(tag)}
              className={cn(
                'whitespace-nowrap border px-2 text-base rounded-md',
                'transition duration-200 ease-in-out',
                {
                  'bg-white': !tagsToShow.includes(tag),
                  'bg-sky-600 text-white': tagsToShow.includes(tag)
                }
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className={cn('flex items-center gap-3 p-4 bg-white rounded-xl')}>
        <div className={cn('grid place-items-center text-slate-500')}>
          <FiSearch className="text-2xl" />
        </div>
        <input
          ref={inputRef}
          className={cn(
            'peer h-full w-full text-ellipsis bg-transparent pr-2 outline-none',
            'm2it-hide-wscb'
          )}
          id="search"
          type="search"
          placeholder={'Search tools...'}
          autoComplete="off"
          value={query}
          onChange={e => handleOnchangeInput(e)}
        />
        {query && (
          <button onClick={() => clearQuery()}>
            <IoCloseCircle className="h-5 w-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Tool list */}
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-600 italic">
          <strong className="font-medium">Remark</strong>: &quot;free&quot; means that the free
          features are enough for me to use, the tools may have paid features. &quot;paid&quot;
          means that I have to pay to use the features I need.
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {toolsToShow.map((tool: Tool) => (
            <ToolItem key={tool.id} tool={tool} />
          ))}
        </div>
        {!toolsToShow.length && (
          <div className="text-slate-500 flex gap-2 items-center justify-center w-full">
            <PiToolboxDuotone className="text-2xl" />
            <div>No tools found.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ToolItem(props: { tool: Tool; className?: string; compactMode?: boolean }) {
  const { tool, className, compactMode } = props
  const convertedIconUrl = defaultMapImageUrl(tool.iconUrl, tool.block)!
  return (
    <a
      href={tool.url}
      target="_blank"
      className={cn(
        className,
        'p-2 bg-white rounded-lg border border-slate-150',
        'transition duration-200 ease-in-out hover:-translate-y-1'
      )}
    >
      <div className={cn('flex flex-row h-full')}>
        <div
          className={cn(
            'w-[90px] h-full rounded-l-lg relative overflow-hidden shrink-0 border-[0.5px] border-slate-100'
          )}
        >
          <div className={cn('relative w-full h-full overflow-hidden')}>
            <div
              style={{
                position: 'absolute',
                inset: '0px',
                backgroundImage: `
                  linear-gradient(#f0f0f0, #f0f0f0),
                  linear-gradient(transparent, transparent),
                  url(${convertedIconUrl})`,
                backgroundBlendMode: 'luminosity, overlay, normal',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center top',
                backgroundSize: '100% 100%',
                filter: 'blur(25px) saturate(1)',
                transform: 'var(1.5) translate3d(0, 0, 0)'
              }}
            ></div>
            <div className={cn('flex items-center justify-center p-8')}>
              <LazyImage
                src={convertedIconUrl}
                alt={tool.name}
                className="w-[60px] h-[60px] max-w-[60px] absolute inset-0 m-auto rounded-md"
              />
            </div>
          </div>
        </div>
        <div className={cn('min-w-0 flex-1 flex flex-col gap-4 p-3 pl-4')}>
          <div className="flex gap-3 flex-col">
            <div className="font-medium text-slate-700 leading-tight">{tool.name}</div>
            <div className={cn('flex flex-wrap gap-x-1 gap-y-2 text-[0.75rem]')}>
              {tool.isFree ? (
                <span className={cn('bg-emerald-100 text-emerald-800 px-2 rounded-md')}>free</span>
              ) : (
                <span className={cn('bg-rose-100 text-rose-600 px-2 rounded-md')}>paid</span>
              )}
              {!compactMode &&
                tool.tag.map(t => (
                  <span className={cn('bg-gray-100 text-gray-600 px-2 rounded-md')} key={t}>
                    {t}
                  </span>
                ))}
            </div>
          </div>
          {!compactMode && (
            <div className={cn('text-[0.83rem] text-slate-700 break-words overflow')}>
              {tool.description}
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

export function SkeletonToolItem() {
  return (
    <div className="p-2 bg-white rounded-lg border border-slate-150">
      <div className={cn('flex flex-row h-full')}>
        <div
          className={cn(
            'w-[90px] h-full rounded-l-lg relative overflow-hidden shrink-0 border-[0.5px] border-slate-100'
          )}
        >
          <div className={cn('relative w-full h-full overflow-hidden')}>
            <div
              style={{
                position: 'absolute',
                inset: '0px',
                backgroundImage: `
                  linear-gradient(#f0f0f0, #f0f0f0),
                  linear-gradient(transparent, transparent),
                  url()`,
                backgroundBlendMode: 'luminosity, overlay, normal',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center top',
                backgroundSize: '100% 100%',
                filter: 'blur(25px) saturate(1)',
                transform: 'var(1.5) translate3d(0, 0, 0)'
              }}
            ></div>
            <div className={cn('flex items-center justify-center p-8')}>
              <div
                className={cn(
                  'animate-pulse w-[60px] h-[60px] max-w-[60px] absolute inset-0 m-auto rounded-full bg-slate-200'
                )}
              ></div>
            </div>
          </div>
        </div>
        <div className={cn('min-w-0 flex-1 flex flex-col gap-4 p-3 pl-4 animate-pulse')}>
          <div className="flex gap-1.5 flex-col">
            <div className="font-semibold text-slate-700">
              <div className="w-1/2 h-5 bg-slate-100 rounded-md"></div>
            </div>
            <div className={cn('flex flex-wrap gap-x-1 gap-y-2 text-[0.75rem]')}>
              <div className="w-8 h-3 bg-slate-100 rounded-md"></div>
              <div className="w-8 h-3 bg-slate-100 rounded-md"></div>
            </div>
          </div>
          <div className={cn('text-[0.83rem] text-slate-700 break-words overflow')}>
            <div className="w-full h-3 bg-slate-100 rounded-md"></div>
            <div className="w-4/5 h-3 bg-slate-100 rounded-md mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
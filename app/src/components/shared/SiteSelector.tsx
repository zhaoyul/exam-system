import { useState, useMemo, useCallback } from 'react'
import { ChevronRight, ChevronDown, MapPin, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SiteNode {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 父级 ID，顶级 (省份) 为 null */
  parentId: string | null
  /** 子节点 */
  children?: SiteNode[]
}

export interface SiteSelectorProps {
  /** 站点树数据 */
  sites: SiteNode[]
  /** 当前选中的站点 ID */
  value?: string
  /** 选择回调 */
  onChange?: (siteId: string, path: string[]) => void
  /** 占位文案 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 额外的 class */
  className?: string
}

type ExpandedState = Record<string, boolean>

/**
 * 树形站点选择器 —— 省 → 站点两级联动
 *
 * 展开省份后显示下属站点列表，选中后展示完整路径。
 * 支持受控/非受控两种使用方式。
 *
 * @example
 * <SiteSelector
 *   sites={[
 *     { id: 'gd', name: '广东省', parentId: null, children: [
 *       { id: 'dyw', name: '大亚湾核电', parentId: 'gd' },
 *       { id: 'yj', name: '阳江核电', parentId: 'gd' },
 *     ]}
 *   ]}
 *   value={selectedId}
 *   onChange={(id, path) => console.log(id, path)}
 * />
 */
export function SiteSelector({
  sites,
  value,
  onChange,
  placeholder = '请选择站点',
  disabled = false,
  className,
}: SiteSelectorProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [selectedPath, setSelectedPath] = useState<string[]>([])

  // Derive selected value (support both controlled and uncontrolled)
  const isControlled = value !== undefined

  const selectedId = isControlled ? value : undefined

  // Build lookup map for quick path resolution
  const nodeMap = useMemo(() => {
    const map = new Map<string, SiteNode>()
    const walk = (nodes: SiteNode[]) => {
      nodes.forEach((n) => {
        map.set(n.id, n)
        if (n.children) walk(n.children)
      })
    }
    walk(sites)
    return map
  }, [sites])

  // Resolve selected path
  const resolvedPath = useMemo(() => {
    if (!selectedId) return []
    const current = nodeMap.get(selectedId)
    if (!current) return []
    const path: string[] = [current.name]
    let parentId = current.parentId
    while (parentId) {
      const parent = nodeMap.get(parentId)
      if (!parent) break
      path.unshift(parent.name)
      parentId = parent.parentId
    }
    return path
  }, [selectedId, nodeMap])

  // Handle controlled/uncontrolled internal selection
  const handleSelect = useCallback(
    (siteId: string) => {
      const node = nodeMap.get(siteId)
      if (!node) return
      const path: string[] = [node.name]
      let parentId = node.parentId
      while (parentId) {
        const parent = nodeMap.get(parentId)
        if (!parent) break
        path.unshift(parent.name)
        parentId = parent.parentId
      }
      if (!isControlled) {
        setSelectedPath(path)
      }
      onChange?.(siteId, path)
    },
    [nodeMap, onChange, isControlled],
  )

  const toggleExpand = useCallback((provinceId: string) => {
    setExpanded((prev) => ({ ...prev, [provinceId]: !prev[provinceId] }))
  }, [])

  const provinces = sites.filter((s) => s.parentId === null)

  const displayPath = isControlled ? resolvedPath : selectedPath

  return (
    <div className={cn('w-full', className)}>
      {/* Selector trigger area */}
      <div
        className={cn(
          'flex min-h-9 w-full items-center rounded-md border px-3 py-2 text-sm',
          'border-input bg-transparent shadow-xs',
          !disabled && 'cursor-pointer hover:bg-accent/50',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {displayPath.length > 0 ? (
          <div className="flex items-center gap-1.5 text-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{displayPath.join(' / ')}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {/* Tree panel */}
      {!disabled && (
        <div className="mt-1 rounded-md border bg-background shadow-sm max-h-64 overflow-y-auto">
          {provinces.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              暂无站点数据
            </div>
          ) : (
            <div className="divide-y divide-border">
              {provinces.map((province) => {
                const isOpen = expanded[province.id]
                const sites = province.children || []
                return (
                  <div key={province.id}>
                    {/* Province row */}
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                        'hover:bg-accent/50',
                        isOpen && 'bg-accent/30',
                      )}
                      onClick={() => toggleExpand(province.id)}
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{province.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {sites.length} 个站点
                      </span>
                    </button>

                    {/* Sites under province */}
                    {isOpen && sites.length > 0 && (
                      <div className="border-t border-border bg-muted/30">
                        {sites.map((site) => {
                          const isSelected = isControlled
                            ? site.id === value
                            : false
                          return (
                            <button
                              key={site.id}
                              type="button"
                              className={cn(
                                'flex w-full items-center gap-2 px-6 py-2 text-sm transition-colors',
                                'hover:bg-accent/50',
                                isSelected && 'bg-accent text-accent-foreground font-medium',
                              )}
                              onClick={() => handleSelect(site.id)}
                            >
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{site.name}</span>
                              {isSelected && (
                                <span className="ml-auto text-xs text-primary">✓</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {isOpen && sites.length === 0 && (
                      <div className="px-6 py-2 text-xs text-muted-foreground border-t border-border">
                        暂无站点
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 从扁平 Organization 数组构建树形 SiteNode 数组
 *
 * @param orgs 扁平的 { id, name, parentId } 数组
 * @returns 树形 SiteNode[]
 */
export function buildSiteTree(
  orgs: { id: string; name: string; parentId: string | null }[],
): SiteNode[] {
  const map = new Map<string, SiteNode>()
  const roots: SiteNode[] = []

  // First pass: create nodes
  orgs.forEach((org) => {
    map.set(org.id, { id: org.id, name: org.name, parentId: org.parentId, children: [] })
  })

  // Second pass: link children
  orgs.forEach((org) => {
    const node = map.get(org.id)!
    if (org.parentId && map.has(org.parentId)) {
      map.get(org.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  // Clean up empty children arrays
  const cleanEmptyChildren = (nodes: SiteNode[]) => {
    nodes.forEach((n) => {
      if (n.children && n.children.length === 0) {
        delete n.children
      } else if (n.children) {
        cleanEmptyChildren(n.children)
      }
    })
  }
  cleanEmptyChildren(roots)

  return roots
}

export default SiteSelector

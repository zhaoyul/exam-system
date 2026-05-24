import { useState, useRef, useCallback } from 'react'
import { X, AlertCircle, CheckCircle2, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhotoValidationResult {
  /** 是否通过校验 */
  valid: boolean
  /** 实际宽度 (px) */
  width: number
  /** 实际高度 (px) */
  height: number
  /** 校验信息 */
  message: string
}

export interface PhotoUploadProps {
  /** 当前照片 data URL（用于回显） */
  value?: string | null
  /** 文件/照片变更回调 */
  onChange?: (dataUrl: string | null, file: File | null) => void
  /** 校验结果回调 */
  onValidate?: (result: PhotoValidationResult) => void
  /** 最小允许宽度 (默认 300) */
  minWidth?: number
  /** 最大允许宽度 (默认 500) */
  maxWidth?: number
  /** 样本图 URL */
  sampleSrc?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 额外的 class */
  className?: string
  /** 接受的文件类型 (默认 image/jpeg,image/png) */
  accept?: string
  /** 最大文件大小 (字节，默认 5MB) */
  maxSize?: number
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png'
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * 一寸照片上传组件
 *
 * 功能：
 * 1. 拖拽/点击上传照片
 * 2. 校验照片宽度在 300-500px 之间
 * 3. 显示样本参考图
 * 4. 上传预览与删除
 *
 * @example
 * <PhotoUpload
 *   value={photoUrl}
 *   onChange={(url, file) => setPhoto(url)}
 *   onValidate={(result) => setValid(result.valid)}
 *   sampleSrc="/samples/id-photo-sample.jpg"
 *   minWidth={300}
 *   maxWidth={500}
 * />
 */
export function PhotoUpload({
  value,
  onChange,
  onValidate,
  minWidth = 300,
  maxWidth = 500,
  sampleSrc,
  disabled = false,
  className,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
}: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<PhotoValidationResult | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)

  const inputRef = useRef<HTMLInputElement>(null)

  const validateImage = useCallback(
    (file: File): Promise<PhotoValidationResult> => {
      return new Promise((resolve) => {
        // Check file size
        if (file.size > maxSize) {
          const sizeMB = (maxSize / (1024 * 1024)).toFixed(0)
          resolve({
            valid: false,
            width: 0,
            height: 0,
            message: `文件大小不能超过 ${sizeMB}MB`,
          })
          return
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          resolve({
            valid: false,
            width: 0,
            height: 0,
            message: '请上传图片文件（JPEG / PNG）',
          })
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new window.Image()
          img.onload = () => {
            const { naturalWidth: width, naturalHeight: height } = img

            if (width < minWidth) {
              resolve({
                valid: false,
                width,
                height,
                message: `照片宽度为 ${width}px，需至少 ${minWidth}px（标准一寸照为 ${minWidth}-${maxWidth}px）`,
              })
              return
            }

            if (width > maxWidth) {
              resolve({
                valid: false,
                width,
                height,
                message: `照片宽度为 ${width}px，需不超过 ${maxWidth}px（标准一寸照为 ${minWidth}-${maxWidth}px）`,
              })
              return
            }

            resolve({
              valid: true,
              width,
              height,
              message: `照片尺寸 ${width}×${height}px，符合要求`,
            })
          }
          img.onerror = () => {
            resolve({
              valid: false,
              width: 0,
              height: 0,
              message: '无法读取图片信息，请确认文件格式正确',
            })
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    },
    [minWidth, maxWidth, maxSize],
  )

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      const result = await validateImage(file)

      if (!result.valid) {
        setError(result.message)
        setValidation(result)
        onValidate?.(result)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreview(dataUrl)
        setValidation(result)
        setError(null)
        onChange?.(dataUrl, file)
        onValidate?.(result)
      }
      reader.readAsDataURL(file)
    },
    [validateImage, onChange, onValidate],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // Reset input so the same file can be re-selected
      e.target.value = ''
    },
    [processFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [disabled, processFile],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setDragOver(true)
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleRemove = useCallback(() => {
    setPreview(null)
    setValidation(null)
    setError(null)
    onChange?.(null, null)
  }, [onChange])

  // Sync external value changes
  const currentPreview = value !== undefined ? value : preview

  const isAcceptJpeg = accept.includes('jpeg') || accept.includes('jpg')
  const acceptHint = isAcceptJpeg ? 'JPG / PNG' : '图片'

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload area */}
      <div className="flex gap-4">
        {/* Upload box */}
        <div
          className={cn(
            'relative flex flex-col items-center justify-center',
            'w-36 h-44 rounded-lg border-2 border-dashed transition-colors',
            !disabled && 'cursor-pointer',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-accent/30',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive/50 bg-destructive/5',
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          {currentPreview ? (
            <>
              <img
                src={currentPreview}
                alt="照片预览"
                className="h-full w-full rounded-lg object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  className={cn(
                    'absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center',
                    'rounded-full bg-destructive text-destructive-foreground shadow-sm',
                    'hover:bg-destructive/90 transition-colors',
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-3 text-center">
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500">
                点击或拖拽上传
                <br />
                一寸免冠照片
              </span>
              <span className="text-[10px] text-gray-400">
                支持 {acceptHint}，≤{(maxSize / (1024 * 1024)).toFixed(0)}MB
              </span>
            </div>
          )}
        </div>

        {/* Sample image */}
        {sampleSrc && (
          <div className="flex flex-col items-center">
            <div className="w-36 h-44 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={sampleSrc}
                alt="一寸照样本"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1.5">一寸照样本</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        aria-label="上传一寸照片"
      />

      {/* Validation result */}
      {validation && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-md p-2.5 text-sm',
            validation.valid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          )}
        >
          {validation.valid ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
          )}
          <div>
            <p>{validation.message}</p>
            {validation.width > 0 && (
              <p className="text-xs mt-0.5 opacity-75">
                实际尺寸: {validation.width} × {validation.height} px
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && !validation && (
        <div className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default PhotoUpload

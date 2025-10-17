import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden z-[10000]"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  onClose?: () => void
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-xl font-semibold text-gray-900">
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return (
    <p className="text-sm text-gray-500 mt-1">
      {children}
    </p>
  )
}

interface DialogBodyProps {
  children: React.ReactNode
}

export function DialogBody({ children }: DialogBodyProps) {
  return (
    <div className="p-6 overflow-y-auto">
      {children}
    </div>
  )
}

interface DialogFooterProps {
  children: React.ReactNode
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
      {children}
    </div>
  )
}

import { useState, useEffect } from 'react'

type Environment = 'test' | 'production'

interface EnvironmentToggleProps {
  onEnvironmentChange?: (env: Environment) => void
}

export function EnvironmentToggle({ onEnvironmentChange }: EnvironmentToggleProps) {
  const [environment, setEnvironment] = useState<Environment>('test')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingEnvironment, setPendingEnvironment] = useState<Environment | null>(null)

  // Load environment from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('adminEnvironment') as Environment | null
    if (saved && (saved === 'test' || saved === 'production')) {
      setEnvironment(saved)
    }
  }, [])

  const handleToggle = (newEnv: Environment) => {
    if (newEnv === 'production' && environment === 'test') {
      // Show confirmation when switching to production
      setPendingEnvironment(newEnv)
      setShowConfirmation(true)
    } else {
      // Direct switch for test mode
      switchEnvironment(newEnv)
    }
  }

  const switchEnvironment = (newEnv: Environment) => {
    setEnvironment(newEnv)
    localStorage.setItem('adminEnvironment', newEnv)
    onEnvironmentChange?.(newEnv)
    setShowConfirmation(false)
    setPendingEnvironment(null)
  }

  const handleConfirm = () => {
    if (pendingEnvironment) {
      switchEnvironment(pendingEnvironment)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setPendingEnvironment(null)
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E7EB]">
        <span className="text-[13px] font-medium text-[#6B7280]">Environment:</span>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleToggle('test')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              environment === 'test'
                ? 'bg-[#E5E7EB] text-[#1A1A1A]'
                : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#D1D5DB]'
            }`}
          >
            Test
          </button>
          
          <button
            onClick={() => handleToggle('production')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              environment === 'production'
                ? 'bg-[#DC2626] text-white'
                : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#D1D5DB]'
            }`}
          >
            Production
          </button>
        </div>

        {environment === 'production' && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-[#FEE2E2] rounded-md">
            <span className="text-[12px] text-[#DC2626] font-medium">⚠ Production Mode</span>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-lg">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">
              Switch to Production Mode?
            </h3>
            <p className="text-[14px] text-[#6B7280] mb-4">
              Production mode will use live Bedrock models and save all results to the production database. This will incur real costs.
            </p>
            <p className="text-[13px] text-[#DC2626] font-medium mb-6">
              Please ensure you have tested thoroughly in Test mode first.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md text-[13px] font-medium text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-md text-[13px] font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all"
              >
                Switch to Production
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

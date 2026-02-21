import { Link } from 'react-router-dom'
import { usePersonas } from '@/hooks/usePersonas'
import { useMerchant } from '@/hooks/useMerchant'

interface PlanLimitGuardProps {
  children: React.ReactNode
  action: 'create_character' | 'view'
}

export function PlanLimitGuard({ children, action }: PlanLimitGuardProps) {
  const { personas, isLoading } = usePersonas()
  const { merchant, isLoading: merchantLoading } = useMerchant()

  if (isLoading || merchantLoading || action !== 'create_character') {
    return <>{children}</>
  }

  const limit = merchant?.plan_limits?.characters ?? 1
  const used = personas.length
  const atLimit = limit > 0 && used >= limit

  if (!atLimit) {
    return <>{children}</>
  }

  return (
    <div className="p-8 bg-[#F5F5F5] min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-[#FFFBEB] border border-[#F59E0B] rounded-lg p-6">
        <h3 className="font-semibold text-[15px] text-[#1A1A1A]">
          You&apos;ve reached your character limit.
        </h3>
        <p className="mt-2 text-[14px] text-[#6B7280]">
          Upgrade to Pro to create up to 5 characters.
        </p>
        <Link
          to="/dashboard/billing"
          className="mt-4 inline-block text-[14px] text-[#1A1A1A] font-medium underline"
        >
          View Plans
        </Link>
      </div>
    </div>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
    steps: string[]
    currentStep: number
    className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn("flex items-center justify-center w-full mb-8", className)}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                                index < currentStep
                                    ? "bg-brand text-brand-foreground"
                                    : index === currentStep
                                        ? "bg-brand text-brand-foreground ring-4 ring-brand/30"
                                        : "bg-muted text-muted-foreground"
                            )}
                        >
                            {index < currentStep ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span
                            className={cn(
                                "mt-2 text-xs text-center max-w-20",
                                index <= currentStep ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "flex-1 h-1 mx-2 rounded transition-all",
                                index < currentStep ? "bg-brand" : "bg-muted"
                            )}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

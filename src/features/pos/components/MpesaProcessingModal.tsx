import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Clock, RotateCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PaymentStatus = 'processing' | 'waiting' | 'success' | 'failed' | 'timeout';

const statusConfig = {
  processing: {
    title: 'Processing Payment',
    description: 'Initiating M-Pesa payment request...',
    icon: Loader2,
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
  },
  waiting: {
    title: 'Awaiting Payment',
    description: 'Please check your phone to complete the payment',
    icon: Clock,
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500',
  },
  success: {
    title: 'Payment Received',
    description: 'Your payment has been processed successfully',
    icon: CheckCircle,
    color: 'bg-green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-500',
  },
  failed: {
    title: 'Payment Failed',
    description: 'We couldn\'t process your payment',
    icon: XCircle,
    color: 'bg-red-500',
    textColor: 'text-red-600',
    borderColor: 'border-red-500',
  },
  timeout: {
    title: 'Payment Timed Out',
    description: 'The payment request has timed out',
    icon: AlertCircle,
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500',
  },
};

interface MpesaProcessingModalProps {
  isOpen: boolean;
  status: PaymentStatus;
  error?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function MpesaProcessingModal({
  isOpen,
  status,
  error,
  onClose,
  onRetry,
}: MpesaProcessingModalProps) {
  const config = statusConfig[status] || statusConfig.processing;
  const Icon = config.icon;

  // Progress steps configuration
  const steps = [
    { id: 'processing', label: 'Processing' },
    { id: 'waiting', label: 'Waiting' },
    { id: 'complete', label: 'Complete' },
  ];

  const currentStep = status === 'success' ? 2 : status === 'waiting' ? 1 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-auto overflow-hidden border border-gray-100"
          >
            {/* Status Bar */}
            <div className={`h-2 ${config.color} w-full`}></div>
            
            <div className="p-6">
              {/* Progress Steps */}
              <div className="relative mb-8">
                <div className="flex justify-between mb-2">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex flex-col items-center ${index < currentStep ? config.textColor : 'text-gray-400'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                        ${index < currentStep 
                          ? `${config.color} text-white` 
                          : index === currentStep 
                            ? `border-2 ${config.borderColor} ${config.textColor}`
                            : 'border-2 border-gray-300 bg-white'}`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : index === currentStep ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium">{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 -z-10">
                  <motion.div 
                    className={`h-full ${config.color}`}
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${(currentStep / (steps.length - 1)) * 100}%`,
                      transition: { duration: 0.5, ease: 'easeInOut' }
                    }}
                  />
                </div>
              </div>

              {/* Status Content */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${config.color.replace('500', '100')} mb-4`}>
                  <Icon className={`w-10 h-10 ${config.textColor} ${['processing', 'waiting'].includes(status) ? 'animate-pulse' : ''}`} />
                </div>
                
                <h3 className="text-xl font-semibold">{config.title}</h3>
                
                <p className="text-muted-foreground">
                  {status === 'failed' && error ? error : config.description}
                </p>

                {/* Additional status-specific content */}
                {status === 'processing' && (
                  <div className="w-full mt-4 space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${config.color} w-1/2`}
                        animate={{
                          x: ['-50%', '150%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'easeInOut'
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Setting up payment request...</p>
                  </div>
                )}

                {status === 'waiting' && (
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-3 h-3 rounded-full ${config.color}`}
                          animate={{
                            y: ['0%', '-50%', '0%'],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Waiting for you to complete the payment on your phone...</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {(status === 'failed' || status === 'timeout') && (
                    <>
                      <Button variant="outline" onClick={onClose}>
                        Close
                      </Button>
                      <Button onClick={onRetry} className="gap-2">
                        <RotateCw className="w-4 h-4" />
                        Try Again
                      </Button>
                    </>
                  )}
                  
                  {status === 'success' && (
                    <Button onClick={onClose} className="px-8">
                      Done
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface PaymentConfig {
  amount: number
  currency?: string
  studentEmail: string
  studentName: string
  studentPhone: string
  courseId: string
  courseTitle: string
  onSuccess: (response: any) => void
  onClose: () => void
}

export const initiatePayment = ({
  amount,
  currency = 'RWF',
  studentEmail,
  studentName,
  studentPhone,
  courseId,
  courseTitle,
  onSuccess,
  onClose,
}: PaymentConfig) => {
  // Load Flutterwave script if not already loaded
  if (!(window as any).FlutterwaveCheckout) {
    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    document.body.appendChild(script)
    
    script.onload = () => {
      launchPayment()
    }
    
    script.onerror = () => {
      console.error('Failed to load Flutterwave script')
      alert('Payment system temporarily unavailable. Please try again later.')
    }
  } else {
    launchPayment()
  }

  function launchPayment() {
    const FlutterwaveCheckout = (window as any).FlutterwaveCheckout
    
    FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `pbi-${Date.now()}-${courseId}`,
      amount: amount,
      currency: currency,
      payment_options: 'mobilemoneyrwanda,card',
      customer: {
        email: studentEmail,
        phone_number: studentPhone,
        name: studentName,
      },
      customizations: {
        title: 'PBI Academy',
        description: `Enroll: ${courseTitle}`,
        logo: 'https://pbiacademy.com/logo.png',
      },
      callback: onSuccess,
      onclose: onClose,
    })
  }
}

// Helper to verify payment on backend
export async function verifyPayment(transactionId: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionId }),
  })
  
  if (!response.ok) throw new Error('Payment verification failed')
  return response.json()
}

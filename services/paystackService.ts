export interface PaystackConfig {
    key: string;
    email: string;
    amount: number;
    reference: string;
    currency?: string;
    metadata: {
        courseId: string;
        userId: string;
        [key: string]: any;
    };
    onSuccess: (response: { reference: string; status: string }) => void;
    onCancel: () => void;
}

export const initializePaystack = (config: PaystackConfig) => {
    // Paystack Popup script is usually loaded via CDN in index.html for simplicity
    // or via a library like react-paystack.
    // We'll implement a dynamic loader for maximum reliability.

    const handler = (window as any).PaystackPop?.setup({
        key: config.key,
        email: config.email,
        amount: config.amount * 100, // Paystack expects amount in Kobo
        currency: config.currency || 'NGN',
        ref: config.reference,
        metadata: config.metadata,
        callback: (response: any) => {
            config.onSuccess(response);
        },
        onClose: () => {
            config.onCancel();
        },
    });

    if (handler) {
        handler.openIframe();
    } else {
        console.error("PaystackPop is not initialized. Ensure the script is loaded.");
    }
};

export const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if ((window as any).PaystackPop) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.body.appendChild(script);
    });
};

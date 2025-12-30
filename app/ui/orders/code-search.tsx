'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { TRACKING_CODE_LENGTH } from '@/lib/consts';
import { Button } from '@/components/ui/button';

export default function TrackingCodeSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [trackingCode, setTrackingCode] = useState<string|undefined>(searchParams.get('query')?.toString());
    const trackingCodeLength = TRACKING_CODE_LENGTH;

    const searchOrder = (term?: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-center items-center">
            <div className="flex flex-col">
                <InputOTP
                    className=""
                    id="code"
                    name="code"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    value={trackingCode}
                    onChange={(newCode)=>{setTrackingCode(newCode)}}
                >
                    <InputOTPGroup className="bg-white rounded-md">
                        {[...Array(trackingCodeLength)].map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
            </div>
            <Button className="mt-4 md:ml-4 md:mt-0" type="button" onClick={() =>{searchOrder(trackingCode)}}>
                Buscar <MagnifyingGlassIcon className='ml-4'/>
            </Button>
        </div>
    );
}
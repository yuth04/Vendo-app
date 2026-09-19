'use client';

import { useEffect } from 'react';
import { authService } from '@/src/app/components/modules/auth/core/services/authService';

export default function TokenWatcher() {
    useEffect(() => {
        authService.initTokenWatcher();
    }, []);

    return null;
}
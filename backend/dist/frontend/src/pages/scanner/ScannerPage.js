import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, QrCodeIcon, TicketIcon } from '@heroicons/react/24/solid';
const api = {
    login: async (pin) => {
        const res = await fetch('/api/scanner/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        return res.json();
    },
    checkIn: async (eventId, token) => {
        const res = await fetch('/api/scanner/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, ...token })
        });
        const data = await res.json();
        if (!res.ok) {
            throw data;
        }
        return data;
    }
};
export default function ScannerPage() {
    const [event, setEvent] = useState(null);
    const [pin, setPin] = useState('');
    const [loginError, setLoginError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const scannerRef = useRef(null);
    const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    useEffect(() => {
        if (!event || showBackupCodeInput)
            return;
        const qrScanner = new Html5Qrcode('qr-reader');
        scannerRef.current = qrScanner;
        const startScanner = async () => {
            try {
                if (qrScanner.getState() === Html5QrcodeScannerState.SCANNING)
                    return;
                await qrScanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }, (decodedText) => {
                    qrScanner.pause(true);
                    try {
                        const url = new URL(decodedText);
                        const qrToken = url.pathname.split('/').pop();
                        if (qrToken)
                            handleCheckIn({ qrToken });
                    }
                    catch (e) {
                        handleCheckIn({ qrToken: decodedText }); // Handle non-URL QR codes
                    }
                }, undefined);
            }
            catch (err) {
                setValidationResult({ status: 'error', message: `Erro na câmara: ${err.message}` });
            }
        };
        startScanner();
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [event, showBackupCodeInput]);
    const handlePinLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError(null);
        try {
            const result = await api.login(pin);
            if (result.success && result.event) {
                setEvent(result.event);
            }
            else {
                setLoginError(result.error || 'PIN inválido.');
            }
        }
        catch (err) {
            setLoginError('Ocorreu um erro de rede.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCheckIn = async (token) => {
        if (!event)
            return;
        setIsLoading(true);
        setValidationResult(null);
        try {
            const result = await api.checkIn(event.id, token);
            setValidationResult({ status: 'success', message: result.message, guestName: result.guest.name, guestTable: result.guest.table });
            // new Audio('/sounds/success.mp3').play() // Uncomment if you have sound files in /public/sounds
        }
        catch (error) {
            const status = error.status === 'already_checked_in' ? 'warning' : 'error';
            setValidationResult({ status, message: error.message, guestName: error.guest?.name, guestTable: error.guest?.table });
            // new Audio(status === 'warning' ? '/sounds/warning.mp3' : '/sounds/error.mp3').play()
        }
        finally {
            setIsLoading(false);
            setTimeout(() => {
                setValidationResult(null);
                if (scannerRef.current?.isScanning)
                    scannerRef.current?.resume();
                setBackupCode('');
            }, 5000);
        }
    };
    const handleBackupCodeSubmit = (e) => {
        e.preventDefault();
        if (backupCode.length >= 6)
            handleCheckIn({ backupCode });
    };
    if (!event) {
        return (<div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-full max-w-xs text-center">
          <QrCodeIcon className="mx-auto h-12 w-12 text-cyan-400"/>
          <h1 className="mt-4 text-2xl font-bold">Acesso do Segurança</h1>
          <p className="mt-2 text-slate-400">Insira o PIN do evento para começar a validar.</p>
          <form onSubmit={handlePinLogin} className="mt-8">
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full rounded-lg border-2 border-slate-700 bg-slate-800 p-4 text-center text-2xl tracking-[0.2em] text-white focus:border-cyan-500 focus:outline-none" placeholder="••••••" disabled={isLoading}/>
            {loginError && <p className="mt-2 text-sm text-rose-400">{loginError}</p>}
            <button type="submit" disabled={isLoading || !pin} className="mt-6 w-full rounded-full bg-cyan-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">
              {isLoading ? 'A validar...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>);
    }
    const ResultIcon = {
        success: <CheckCircleIcon className="h-20 w-20 text-emerald-400"/>,
        error: <XCircleIcon className="h-20 w-20 text-rose-400"/>,
        warning: <ExclamationTriangleIcon className="h-20 w-20 text-amber-400"/>,
        idle: null
    };
    return (<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute top-4 left-4 text-left">
        <p className="text-sm text-slate-400">Evento</p>
        <h2 className="font-bold">{event.name}</h2>
      </div>
      <div id="qr-reader" className={`w-full max-w-md ${showBackupCodeInput ? 'hidden' : ''}`}></div>

      {validationResult && (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-8 text-center backdrop-blur-sm">
          {ResultIcon[validationResult.status]}
          <h2 className="mt-4 text-3xl font-bold">{validationResult.guestName || 'Validação'}</h2>
          {validationResult.guestTable && <p className="text-xl text-amber-300">Mesa: {validationResult.guestTable}</p>}
          <p className="mt-2 text-lg text-slate-300">{validationResult.message}</p>
        </div>)}

      {isLoading && !validationResult && (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <p className="text-lg">A validar...</p>
        </div>)}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        {showBackupCodeInput ? (<form onSubmit={handleBackupCodeSubmit} className="mx-auto w-full max-w-sm">
            <input type="text" value={backupCode} onChange={(e) => setBackupCode(e.target.value.toUpperCase())} maxLength={6} className="w-full rounded-lg border-2 border-slate-700 bg-slate-800 p-4 text-center text-2xl tracking-[0.2em] text-white focus:border-cyan-500 focus:outline-none" placeholder="CÓDIGO" disabled={isLoading}/>
            <button type="submit" disabled={isLoading || backupCode.length < 6} className="mt-2 w-full rounded-full bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50">
              Validar Código
            </button>
            <button type="button" onClick={() => setShowBackupCodeInput(false)} className="mt-2 text-sm text-slate-400 hover:text-white">
              Voltar ao Scanner
            </button>
          </form>) : (<button onClick={() => setShowBackupCodeInput(true)} className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-slate-700">
            <TicketIcon className="h-5 w-5"/> Usar código de backup
          </button>)}
      </div>
    </div>);
}
//# sourceMappingURL=ScannerPage.js.map
import { useState, useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { ProgressSpinner } from 'primereact/progressspinner';
import { addLocale } from 'primereact/api';
import './../App.css';


interface FolioOption {
    label: string;
    value: string;
}

addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Limpiar',
    dateFormat: 'yy-mm-dd',
    weekHeader: 'Sem'
});

function ReporteExcel() {
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [folio, setFolio] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const apiUrl = import.meta.env.VITE_URL_MODULOS_BACK;


    const folios: FolioOption[] = [
        { label: 'SP', value: 'SP' },
        { label: 'DA', value: 'DA' },
        { label: 'IVJ', value: 'IVJ' },
        { label: 'IVAIS', value: 'IVAIS' },
        { label: 'AS', value: 'AS' },
        { label: 'UG', value: 'UG' },
        { label: 'UT', value: 'UT' },
    ];

   
    const handleDownload = async () => {
        if (!fechaInicio || !fechaFin) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Selecciona ambas fechas.',
                life: 3000,
            });
            return;
        }

        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        const folioFinal = folio || '';

        const url = `${apiUrl}/viaticos/reporte-excel/${fechaInicioStr}/${fechaFinStr}/${folioFinal}`;

        setLoading(true);

        try {
            const response = await axios.get(url, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const nombreArchivo = `reporte_viaticos_${fechaInicioStr}_a_${fechaFinStr}_folio_${folioFinal}.xlsx`;
            link.href = downloadUrl;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setFechaInicio(null);
            setFechaFin(null);
            setFolio(null);

            toast.current?.show({
                severity: 'success',
                summary: 'Descarga completa',
                detail: 'El archivo se descargó correctamente.',
                life: 3000,
            });
        } catch (error) {
            console.error('Error al descargar el archivo', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error de descarga',
                detail: 'No se pudo descargar el archivo.',
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 flex justify-content-center">
            <Toast ref={toast} position="top-center" />
            <Card title="Reporte Excel" className="w-full md:w-5" style={{color:'#9D0639'}}>

                <div className="flex flex-column gap-3 mb-4">
                    <div className="flex flex-column gap-1">
                        <label htmlFor="fechaInicio">Fecha Inicio</label>
                        <Calendar
                            id="fechaInicio"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.value as Date)}
                            dateFormat="yy-mm-dd"
                            locale="es"
                            showIcon
                            className="w-full custom-calendar"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="fechaFin">Fecha Fin</label>
                        <Calendar
                            id="fechaFin"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.value as Date)}
                            dateFormat="yy-mm-dd"
                            locale="es"
                            showIcon
                            className="w-full custom-calendar"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-column gap-1">
                        <label htmlFor="folio">Folio</label>
                        <Dropdown
                            id="folio"
                            value={folio}
                            options={folios}
                            onChange={(e) => setFolio(e.value)}
                            placeholder="Selecciona un folio"
                            className="w-full"
                            disabled={loading}
                        />
                    </div>
                </div>

                <Button
                    label={loading ? 'Descargando...' : 'Descargar Excel'}
                    icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-download'}
                    onClick={handleDownload}
                    className="w-full custom-button"
                    disabled={loading}
                />

                {loading && (
                    <div className="flex justify-content-center mt-4">
                        <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                    </div>
                )}

            </Card>
        </div>
    );
}

export default ReporteExcel;

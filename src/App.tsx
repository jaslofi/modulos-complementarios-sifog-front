// App.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import './App.css';

interface Comprobante {
  idComprobante: number;
  folioComprobante: string;
  url: string;
}

const DEBOUNCE_DELAY = 500;
const MIN_SEARCH_LENGTH = 3;

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentResults, setCurrentResults] = useState<Comprobante[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, Comprobante>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedFilesArray = Object.values(selectedFiles);

  const getKey = (file: Comprobante) => `${file.idComprobante}_${file.url}`;

  const searchFiles = useCallback(async (term: string) => {
    if (term.trim().length < MIN_SEARCH_LENGTH) {
      setCurrentResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get<Comprobante[]>('http://localhost:3000/api/files', {
        params: { search: term, exactMatch: true }
      });
      setCurrentResults(response.data);
    } catch (error) {
      console.error('Error searching files:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al buscar archivos',
        life: 3000
      });
      setCurrentResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchFiles(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, searchFiles]);

  const toggleFileSelection = (file: Comprobante) => {
    const key = getKey(file);
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      if (newSelection[key]) {
        delete newSelection[key];
      } else {
        newSelection[key] = file;
      }
      return newSelection;
    });
  };

  const removeFromSelection = (file: Comprobante) => {
    const key = getKey(file);
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      delete newSelection[key];
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedFiles({});
  };

  const downloadSelectedFiles = async () => {
    if (selectedFilesArray.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay archivos seleccionados',
        life: 3000
      });
      return;
    }

    try {
      const filenames = selectedFilesArray.map(f => f.url);
      const response = await axios.get('http://localhost:3000/api/files/download-multiple', {
        params: { filenames: filenames.join(',') },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'archivos_seleccionados.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al descargar archivos',
        life: 3000
      });
    }
  };

  const openPreview = (file: Comprobante) => {
    setPreviewUrl(`http://localhost:3000/api/files/preview/${file.url}`);
    setVisiblePreview(true);
  };

  return (
    <div className="file-manager">
      <Toast ref={toast} />

      <Card title="Gestor de Archivos" className="file-manager-card">
        <div className="search-container">
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar folio (mínimo ${MIN_SEARCH_LENGTH} caracteres)`}
            className="search-input"
          />
          {isLoading && <i className="pi pi-spinner pi-spin loading-icon" />}
        </div>

        <ScrollPanel className="results-panel">
          {searchTerm.length > 0 && searchTerm.length < MIN_SEARCH_LENGTH ? (
            <p className="text-sm text-gray-500">Ingrese al menos {MIN_SEARCH_LENGTH} caracteres</p>
          ) : currentResults.length > 0 ? (
            <ul className="file-list">
              {currentResults.map(file => (
                <li key={getKey(file)} className="file-item">
                  <Checkbox
                    inputId={`file-${getKey(file)}`}
                    checked={!!selectedFiles[getKey(file)]}
                    onChange={() => toggleFileSelection(file)}
                    style={{color:'#E2BE89'}}
                  />
                  <label htmlFor={`file-${getKey(file)}`} className="file-label">
                    <span className="file-folio">{file.folioComprobante}</span>
                    <span className="file-url">{file.url}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No se encontraron resultados' : ''}
            </p>
          )}
        </ScrollPanel>

        {selectedFilesArray.length > 0 && (
          <div className="selected-files">
            <h3>Archivos seleccionados para ZIP ({selectedFilesArray.length})</h3>
            <ScrollPanel className="selected-panel">
              <ul className="selected-list">
                {selectedFilesArray.map(file => (
                  <li key={getKey(file)} className="selected-item">
                    <div className="file-info">
                      <span className="file-folio">{file.folioComprobante}</span> — <span className="file-url">{file.url}</span>
                    </div>
                    <div className="actions">
                      <button
                        className="icon-button preview"
                        onClick={() => openPreview(file)}
                        title="Previsualizar PDF"
                      >
                        <i className="pi pi-eye"></i>
                      </button>
                      <button
                        className="icon-button remove"
                        onClick={() => removeFromSelection(file)}
                        title="Quitar de la selección"
                      >
                        <i className="pi pi-times"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollPanel>

            <div className="actions">
              <Button
                label="Limpiar selección"
                icon="pi pi-trash"
                className='button-style'
                onClick={clearSelection}
              />
              <Button
                label="Descargar ZIP"
                icon="pi pi-download"
                className='button-style2'
                onClick={downloadSelectedFiles}
              />
            </div>
          </div>
        )}
      </Card>

      <Dialog
        header="PDF FACTURA"
        visible={visiblePreview}
         className="custom-dialog"
        style={{ width: '70vw'}}
        onHide={() => setVisiblePreview(false)}
        draggable={false}
        resizable={false}
      >
        {previewUrl && (
          <iframe
            src={previewUrl}
            title="PDF Preview"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default App;

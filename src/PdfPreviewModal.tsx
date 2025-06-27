import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

interface PdfPreviewModalProps {
  fileUrl: string;
  onHide: () => void;
  visible: boolean;
}

const PdfPreviewModal = ({ fileUrl, onHide, visible }: PdfPreviewModalProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError('No se pudo cargar el documento. Puede ser muy grande o estar dañado.');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'documento.pdf';
    link.click();
  };

  const renderFooter = () => {
    if (pdfError || !numPages) return null;

    return (
      <div>
        <Button 
          label="Anterior" 
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(prev => prev - 1)}
          className="p-button-text"
        />
        <span style={{ margin: '0 1rem' }}>
          Página {pageNumber} de {numPages}
        </span>
        <Button 
          label="Siguiente" 
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(prev => prev + 1)}
          className="p-button-text"
        />
      </div>
    );
  };

  const renderContent = () => {
    if (pdfError) {
      return (
        <div className="pdf-error-container">
          <i className="pi pi-exclamation-triangle pdf-error-icon" />
          <p className="pdf-error-message">{pdfError}</p>
          <Button 
            label="Descargar Archivo" 
            icon="pi pi-download"
            onClick={handleDownload}
          />
        </div>
      );
    }

    return (
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={
          <div className="pdf-loading-container">
            <i className="pi pi-spinner pi-spin pdf-loading-icon" />
            <p>Cargando documento...</p>
          </div>
        }
        options={{
          httpHeaders: { 'Cache-Control': 'no-cache' }
        }}
      >
        <Page 
          pageNumber={pageNumber} 
          width={800}
          loading={
            <div className="pdf-page-loading">
              <p>Cargando página {pageNumber}...</p>
            </div>
          }
        />
      </Document>
    );
  };

  return (
    <Dialog
      header="Vista previa del documento"
      visible={visible}
      style={{ width: '80vw', maxWidth: '900px' }}
      onHide={onHide}
      footer={renderFooter()}
    >
      <div className="pdf-preview-container">
        {renderContent()}
      </div>
    </Dialog>
  );
};

export default PdfPreviewModal;
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload, type FileUploadProps, type UploadFile } from './file-upload';

function createMockFile(
  name = 'document.pdf',
  size = 1024,
  type = 'application/pdf',
): File {
  const file = new File(['x'.repeat(size)], name, { type });
  // File constructor may not set size correctly in jsdom; override via defineProperty.
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function renderUpload(props: Partial<FileUploadProps> = {}) {
  const onFilesChange = props.onFilesChange ?? vi.fn();
  return {
    onFilesChange,
    ...render(<FileUpload onFilesChange={onFilesChange} {...props} />),
  };
}

describe('FileUpload', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --- Rendering ---

  it('should render the drop zone with default label', () => {
    renderUpload();
    expect(
      screen.getByText('Drag and drop files here, or click to browse'),
    ).toBeInTheDocument();
  });

  it('should render custom label and description', () => {
    renderUpload({
      label: 'Upload deeds',
      description: 'PDF or DOCX only',
    });
    expect(screen.getByText('Upload deeds')).toBeInTheDocument();
    expect(screen.getByText('PDF or DOCX only')).toBeInTheDocument();
  });

  it('should display accepted file types when accept is provided', () => {
    renderUpload({ accept: '.pdf,.docx' });
    expect(screen.getByText('Accepted: .pdf,.docx')).toBeInTheDocument();
  });

  it('should display max file size when maxFileSize is provided', () => {
    renderUpload({ maxFileSize: 10 * 1024 * 1024 });
    expect(screen.getByText('Max size: 10 MB')).toBeInTheDocument();
  });

  // --- Click-to-browse ---

  it('should open file picker when drop zone is clicked', () => {
    renderUpload();
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByRole('button', { name: /file upload drop zone/i }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should open file picker on Enter key', () => {
    renderUpload();
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.keyDown(
      screen.getByRole('button', { name: /file upload drop zone/i }),
      { key: 'Enter' },
    );
    expect(clickSpy).toHaveBeenCalled();
  });

  // --- File selection via input ---

  it('should add files and call onFilesChange when files are selected', () => {
    const { onFilesChange } = renderUpload();
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const file = createMockFile('contract.pdf', 2048);
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    const uploadedFiles: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploadedFiles).toHaveLength(1);
    expect(uploadedFiles[0].file.name).toBe('contract.pdf');
    expect(uploadedFiles[0].progress).toBe(0);
  });

  it('should support multiple file selection', () => {
    const { onFilesChange } = renderUpload({ multiple: true });
    const input = screen.getByTestId('file-input');

    const files = [
      createMockFile('a.pdf', 100),
      createMockFile('b.pdf', 200),
    ];
    fireEvent.change(input, { target: { files } });

    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded).toHaveLength(2);
  });

  it('should replace file when multiple=false', () => {
    const { onFilesChange } = renderUpload({ multiple: false });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, {
      target: { files: [createMockFile('a.pdf'), createMockFile('b.pdf')] },
    });

    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded).toHaveLength(1);
  });

  // --- File size validation ---

  it('should flag files that exceed maxFileSize', () => {
    const { onFilesChange } = renderUpload({ maxFileSize: 500 });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, {
      target: { files: [createMockFile('big.pdf', 1024)] },
    });

    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded[0].error).toMatch(/exceeds maximum size/i);
  });

  it('should not flag files within maxFileSize', () => {
    const { onFilesChange } = renderUpload({ maxFileSize: 2048 });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, {
      target: { files: [createMockFile('small.pdf', 512)] },
    });

    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded[0].error).toBeUndefined();
  });

  // --- File type validation ---

  it('should flag files with unaccepted extension', () => {
    const { onFilesChange } = renderUpload({ accept: '.pdf' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, {
      target: { files: [createMockFile('image.png', 100, 'image/png')] },
    });

    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded[0].error).toBe('File type not accepted');
  });

  it('should accept files matching MIME wildcard', () => {
    const { onFilesChange } = renderUpload({ accept: 'application/*' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, {
      target: { files: [createMockFile('doc.pdf', 100, 'application/pdf')] },
    });

    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded[0].error).toBeUndefined();
  });

  // --- File preview / list ---

  it('should display file previews with name and size', () => {
    const file = createMockFile('lease.pdf', 5120, 'application/pdf');
    const controlled: UploadFile[] = [
      { id: 'f1', file, progress: 0 },
    ];

    renderUpload({ files: controlled });

    expect(screen.getByText('lease.pdf')).toBeInTheDocument();
    expect(screen.getByText('5 KB')).toBeInTheDocument();
  });

  it('should show progress bar when progress is between 0 and 100', () => {
    const file = createMockFile('deed.pdf', 1024);
    const controlled: UploadFile[] = [
      { id: 'f1', file, progress: 45 },
    ];

    renderUpload({ files: controlled });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '45');
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should show completion text when progress is 100', () => {
    const file = createMockFile('deed.pdf', 1024);
    const controlled: UploadFile[] = [
      { id: 'f1', file, progress: 100 },
    ];

    renderUpload({ files: controlled });
    expect(screen.getByText('Upload complete')).toBeInTheDocument();
  });

  it('should show error message for files with errors', () => {
    const file = createMockFile('bad.exe', 1024);
    const controlled: UploadFile[] = [
      { id: 'f1', file, progress: 0, error: 'File type not accepted' },
    ];

    renderUpload({ files: controlled });
    expect(screen.getByText('File type not accepted')).toBeInTheDocument();
  });

  // --- File removal ---

  it('should remove a file when remove button is clicked', () => {
    const onFilesChange = vi.fn();
    const file1 = createMockFile('a.pdf', 100);
    const file2 = createMockFile('b.pdf', 200);
    const controlled: UploadFile[] = [
      { id: 'f1', file: file1, progress: 0 },
      { id: 'f2', file: file2, progress: 0 },
    ];

    render(
      <FileUpload onFilesChange={onFilesChange} files={controlled} />,
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'f2' }),
    ]);
  });

  // --- Drag and drop ---

  it('should add files on drop', () => {
    const { onFilesChange } = renderUpload();
    const dropZone = screen.getByRole('button', { name: /file upload drop zone/i });

    const file = createMockFile('dropped.pdf', 512);
    const dataTransfer = { files: [file] };

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, { dataTransfer });

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    const uploaded: UploadFile[] = (onFilesChange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(uploaded[0].file.name).toBe('dropped.pdf');
  });

  // --- Disabled state ---

  it('should not open file picker when disabled', () => {
    renderUpload({ disabled: true });
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    const dropZone = screen.getByRole('button', { name: /file upload drop zone/i });
    expect(dropZone).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(dropZone);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  // --- className forwarding ---

  it('should apply custom className to root container', () => {
    const { container } = renderUpload({ className: 'my-custom' });
    expect(container.firstChild).toHaveClass('my-custom');
  });
});

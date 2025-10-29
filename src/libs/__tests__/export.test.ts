import { triggerDownload, exportToPDF, exportToPNG } from '@/libs/export';

jest.mock('html-to-image', () => ({ toPng: jest.fn(() => Promise.resolve('data:image/png;base64,AAA')) }));

class MockPDF {
  width = 100;
  height = 200;
  addImage() {}
  output() { return new Blob(['pdf'], { type: 'application/pdf' }); }
}

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => new MockPDF());
});

describe('export utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('triggerDownload works with blob', () => {
    (global as any).URL.createObjectURL = jest.fn(() => 'blob:url');
    (global as any).URL.revokeObjectURL = jest.fn();

    const clickMock = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(() => ({ href: '', download: '', click: clickMock } as any));

    const b = new Blob(['x'], { type: 'application/json' });
    triggerDownload(b, 'f.json');

    expect((global as any).URL.createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect((global as any).URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('exportToPDF calls html-to-image and returns blob', async () => {
    const el = document.createElement('div');
    // Ensure URL methods exist for jsPDF (if used)
    (global as any).URL.createObjectURL = jest.fn(() => 'blob:url');

    // Mock Image so onload fires
    // @ts-ignore
    const OriginalImage = (global as any).Image;
    // @ts-ignore
    (global as any).Image = class {
      onload: any = null;
      src = '';
      width = 100;
      height = 200;
      set srcSetter(v: string) {
        this.src = v;
        setTimeout(() => this.onload && this.onload(), 0);
      }
      constructor() {
        Object.defineProperty(this, 'src', {
          set: (v: string) => {
            setTimeout(() => this.onload && this.onload(), 0);
          },
        });
      }
    };

    const blob = await exportToPDF(el as HTMLElement);

    // restore
    // @ts-ignore
    (global as any).Image = OriginalImage;

    expect(blob).toBeInstanceOf(Blob);
  });
});

import { TestBed } from '@angular/core/testing';
import { CameraErrorCode, CameraPlugin } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { CAMERA, MediaService } from './media.service';
import { PlatformService } from './platform.service';

describe('MediaService', () => {
  let camera: { takePhoto: ReturnType<typeof vi.fn>; chooseFromGallery: ReturnType<typeof vi.fn> };
  let sheetChoice: string | undefined;
  let sheets: { create: ReturnType<typeof vi.fn> };

  function setup(isNative: boolean) {
    camera = {
      takePhoto: vi.fn().mockResolvedValue({ webPath: 'blob:foto', metadata: { format: 'jpeg' } }),
      chooseFromGallery: vi.fn().mockResolvedValue({ results: [{ webPath: 'blob:galeria' }] }),
    };
    sheets = {
      create: vi.fn().mockResolvedValue({
        present: vi.fn(),
        onWillDismiss: vi.fn(async () => ({ data: sheetChoice })),
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CAMERA, useValue: camera as unknown as CameraPlugin },
        { provide: PlatformService, useValue: { isNative } },
        { provide: ActionSheetController, useValue: sheets },
      ],
    });
    // fetch(webPath) devuelve la imagen como Blob (solo se usa .blob() de la respuesta).
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      blob: async () => new Blob(['png'], { type: 'image/png' }),
    } as Response);
    return TestBed.inject(MediaService);
  }

  afterEach(() => vi.restoreAllMocks());

  it('opens the file picker directly on the web and returns a File', async () => {
    const media = setup(false);

    const file = await media.pickImage({ maxWidth: 800 });

    expect(sheets.create).not.toHaveBeenCalled();
    expect(camera.chooseFromGallery).toHaveBeenCalledWith(
      expect.objectContaining({ targetWidth: 800, webUseInput: true }),
    );
    expect(file).toBeInstanceOf(File);
    expect(file?.type).toBe('image/png');
  });

  it('asks for the source on native and uses the camera', async () => {
    const media = setup(true);
    sheetChoice = 'camera';

    const file = await media.pickImage();

    expect(camera.takePhoto).toHaveBeenCalled();
    expect(file?.name).toBe('imagen.jpeg');
  });

  it('returns null when the user closes the source sheet', async () => {
    const media = setup(true);
    sheetChoice = undefined;

    expect(await media.pickImage()).toBeNull();
    expect(camera.takePhoto).not.toHaveBeenCalled();
  });

  it('treats a cancelled camera as "no image" instead of an error', async () => {
    const media = setup(false);
    camera.chooseFromGallery.mockRejectedValue({ code: CameraErrorCode.ChooseMediaCancelled });

    expect(await media.pickImage()).toBeNull();
  });

  it('rethrows real errors (for example, permission denied)', async () => {
    const media = setup(true);
    sheetChoice = 'camera';
    camera.takePhoto.mockRejectedValue({ code: CameraErrorCode.CameraPermissionDenied });

    await expect(media.pickImage()).rejects.toEqual({
      code: CameraErrorCode.CameraPermissionDenied,
    });
  });
});

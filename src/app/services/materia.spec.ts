import { TestBed } from '@angular/core/testing';
import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

import { MateriaService } from './materia';

// `aws-amplify/data` resolves to this same module, so the mock must also provide
// `generateClient`. The data client is built at module load and unused here.
vi.mock('aws-amplify/api', () => ({
  post: vi.fn(),
  generateClient: () => ({ models: {} }),
}));
vi.mock('aws-amplify/auth', () => ({ fetchAuthSession: vi.fn() }));

describe('MateriaService', () => {
  let service: MateriaService;

  beforeEach(() => {
    vi.mocked(post).mockReset();
    vi.mocked(fetchAuthSession).mockReset();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MateriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrarLog', () => {
    function conSesion(idToken: string | undefined) {
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: idToken ? { idToken: { toString: () => idToken } } : undefined,
      } as Awaited<ReturnType<typeof fetchAuthSession>>);
    }

    it('envía el log a POST /logs con el ID token y sin el usuarioId del cliente', async () => {
      conSesion('id-token');
      vi.mocked(post).mockReturnValue({
        response: Promise.resolve({ statusCode: 201 }),
      } as unknown as ReturnType<typeof post>);

      await service.registrarLog('grupo-1', 'usuario-falso', 'editar_card', 'Card', 'card-1');

      expect(post).toHaveBeenCalledWith({
        apiName: 'gruplabApi',
        path: 'logs',
        options: {
          headers: { Authorization: 'id-token' },
          body: { grupoId: 'grupo-1', accion: 'editar_card', entidad: 'Card', entidadId: 'card-1' },
        },
      });
    });

    it('falla sin llamar al API cuando no hay sesión', async () => {
      conSesion(undefined);

      await expect(
        service.registrarLog('grupo-1', 'u1', 'editar_card', 'Card', 'card-1'),
      ).rejects.toThrow('No hay una sesión activa');
      expect(post).not.toHaveBeenCalled();
    });

    it('propaga el error cuando el API rechaza la petición', async () => {
      conSesion('id-token');
      vi.mocked(post).mockReturnValue({
        response: Promise.reject(new Error('Unauthorized')),
      } as unknown as ReturnType<typeof post>);

      await expect(
        service.registrarLog('grupo-1', 'u1', 'editar_card', 'Card', 'card-1'),
      ).rejects.toThrow('Unauthorized');
    });
  });
});

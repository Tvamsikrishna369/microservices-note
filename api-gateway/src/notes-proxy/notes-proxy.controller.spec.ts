import { Test, TestingModule } from '@nestjs/testing';
import { NotesProxyController } from './notes-proxy.controller';

describe('NotesProxyController', () => {
  let controller: NotesProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesProxyController],
    }).compile();

    controller = module.get<NotesProxyController>(NotesProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

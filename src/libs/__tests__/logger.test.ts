import logger from '@/libs/logger';

describe('logger', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('calls console.debug in dev for debug', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('x');
    expect(spy).toHaveBeenCalledWith('x');
  });

  it('always calls console.error for error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('oops');
    expect(spy).toHaveBeenCalledWith('oops');
  });
});

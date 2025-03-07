// import { Test, TestingModule } from '@nestjs/testing';
// import { GeoService } from './geo.service';
// import Redis from 'ioredis';

// jest.mock('ioredis', () => {
//   return jest.fn().mockImplementation(() => ({
//     geoadd: jest.fn(),
//     hset: jest.fn(),
//     georadius: jest.fn(),
//     geosearch: jest.fn(),
//     hgetall: jest.fn(),
//     zrange: jest.fn(),
//     geopos: jest.fn(),
//     quit: jest.fn(),
//   }));
// });

// describe('GeoService', () => {
//   let geoService: GeoService;
//   let redisClient: Redis;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [GeoService],
//     }).compile();

//     geoService = module.get<GeoService>(GeoService);
//     redisClient = (geoService as any).client; // Private client 접근
//   });

//   it('should be defined', () => {
//     expect(geoService).toBeDefined();
//   });

//   describe('geoAddBookmarkS', () => {
//     it('should add a bookmark to geo data', async () => {
//       const data = {
//         id: 1,
//         achievement_id: 1,
//         title: 'Test',
//         content: 'Content',
//         longitude: 127.0,
//         latitude: 37.0,
//         sub_achievement_images: ['url1'],
//         mission_type: 'LOCATION',
//         expiration_at: '2025-12-31',
//         created_at: '',
//         updated_at: '',
//       };

//       await geoService.geoAddBookmarkS('sub-achievement', data);
//       expect(redisClient.geoadd).toHaveBeenCalledWith('sub-achievement', 127.0, 37.0, '1');
//       expect(redisClient.hset).toHaveBeenCalledWith(`bookmarkS:1`, expect.any(Object));
//     });
//   });

//   describe('getNearbyBookmarksS', () => {
//     it('should return nearby bookmarks', async () => {
//       redisClient.georadius.mockResolvedValue(['1']);
//       redisClient.hgetall.mockResolvedValue({ title: 'Test' });

//       const result = await geoService.getNearbyBookmarksS(37.0, 127.0);
//       expect(result).toEqual([{ id: '1', title: 'Test' }]);
//       expect(redisClient.georadius).toHaveBeenCalledWith('sub-achievement', 37.0, 127.0, 5, 'm');
//     });
//   });

//   describe('getNearbyBookmarkP', () => {
//     it('should return nearest bookmark', async () => {
//       redisClient.geosearch.mockResolvedValue(['1']);
//       redisClient.hgetall.mockResolvedValue({ title: 'Pinkmong' });

//       const result = await geoService.getNearbyBookmarkP(37.0, 127.0);
//       expect(result).toEqual({ id: '1', title: 'Pinkmong' });
//       expect(redisClient.geosearch).toHaveBeenCalledWith(
//         'pinkmong-appear-location',
//         'FROMLONLAT',
//         37.0,
//         127.0,
//         'BYRADIUS',
//         5,
//         'm',
//         'ASC',
//         'COUNT',
//         1,
//       );
//     });
//   });
// });

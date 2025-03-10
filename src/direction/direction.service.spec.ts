import { Test, TestingModule } from '@nestjs/testing';
import { DirectionService } from './direction.service';
import { GeoService } from '../geo/geo.service';
import { AchievementPService } from '../achievement-p/achievement-p.service';
import { DirectionGateway } from './direction.gateway';
import { Socket } from 'socket.io';
import { ValkeyService } from '../valkey/valkey.service';

// 의존성 모킹
const mockValkeyService = {
  // 필요 시 ValkeyService 메서드 추가
};

const mockGeoService = {
  getNearbyBookmarksS: jest.fn(),
  getNearbyBookmarkP: jest.fn(),
};

const mockAchievementPService = {
  post: jest.fn(),
};

const mockDirectionGateway = {
  sendPopup: jest.fn(),
};

const mockClient: Partial<Socket> = {
  emit: jest.fn(),
};

describe('DirectionService', () => {
  let service: DirectionService;

  /** 테스트 모듈 설정 */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectionService,
        { provide: ValkeyService, useValue: mockValkeyService },
        { provide: GeoService, useValue: mockGeoService },
        { provide: AchievementPService, useValue: mockAchievementPService },
        { provide: DirectionGateway, useValue: mockDirectionGateway },
      ],
    }).compile();

    service = module.get<DirectionService>(DirectionService);
  });

  /** 모킹 초기화 */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /** 테스트 케이스 1: 서브 업적 북마크가 5m 이내일 때 */
  it('should trigger sub-achievement event when within 5m', async () => {
    const userId = 1;
    const latitude = 37.123;
    const longitude = 127.456;
    const nearbyBookmarksS = [
      { id: '1', title: 'Bookmark 1' },
      { id: '2', title: 'Bookmark 2' },
    ];

    mockGeoService.getNearbyBookmarksS.mockResolvedValue(nearbyBookmarksS);
    mockGeoService.getNearbyBookmarkP.mockResolvedValue(null);

    await service.compareBookmark(
      userId,
      latitude,
      longitude,
      mockClient as Socket,
    );

    expect(mockGeoService.getNearbyBookmarksS).toHaveBeenCalledWith(
      latitude,
      longitude,
    );
    expect(mockAchievementPService.post).toHaveBeenCalledTimes(2);
    expect(mockAchievementPService.post).toHaveBeenCalledWith(userId, '1');
    expect(mockAchievementPService.post).toHaveBeenCalledWith(userId, '2');
    expect(mockDirectionGateway.sendPopup).not.toHaveBeenCalled();
  });

  /** 테스트 케이스 2: 서브 업적 북마크가 5m 이내에 없을 때 */
  it('should not trigger sub-achievement event when no bookmarks within 5m', async () => {
    const userId = 1;
    const latitude = 37.123;
    const longitude = 127.456;

    mockGeoService.getNearbyBookmarksS.mockResolvedValue([]);
    mockGeoService.getNearbyBookmarkP.mockResolvedValue(null);

    await service.compareBookmark(
      userId,
      latitude,
      longitude,
      mockClient as Socket,
    );

    expect(mockGeoService.getNearbyBookmarksS).toHaveBeenCalledWith(
      latitude,
      longitude,
    );
    expect(mockAchievementPService.post).not.toHaveBeenCalled();
    expect(mockDirectionGateway.sendPopup).not.toHaveBeenCalled();
  });

  /** 테스트 케이스 3: 핑크몽 북마크가 5m 이내일 때 */
  it('should trigger pinkmong event and send popup when within 5m', async () => {
    const userId = 1;
    const latitude = 37.123;
    const longitude = 127.456;
    const nearbyBookmarkP = { id: '3', title: 'Pinkmong Bookmark' };

    mockGeoService.getNearbyBookmarksS.mockResolvedValue([]);
    mockGeoService.getNearbyBookmarkP.mockResolvedValue(nearbyBookmarkP);

    const result = await service.compareBookmark(
      userId,
      latitude,
      longitude,
      mockClient as Socket,
    );

    expect(mockGeoService.getNearbyBookmarkP).toHaveBeenCalledWith(
      latitude,
      longitude,
    );
    expect(mockDirectionGateway.sendPopup).toHaveBeenCalledWith(
      mockClient,
      userId,
      `핑크몽 [${nearbyBookmarkP.title}]에 접근했습니다!`,
    );
    expect(result).toEqual({ triggered: true, bookmark: nearbyBookmarkP });
  });

  /** 테스트 케이스 4: 핑크몽 북마크가 5m 이내에 없을 때 */
  it('should not trigger pinkmong event when no bookmark within 5m', async () => {
    const userId = 1;
    const latitude = 37.123;
    const longitude = 127.456;

    mockGeoService.getNearbyBookmarksS.mockResolvedValue([]);
    mockGeoService.getNearbyBookmarkP.mockResolvedValue(null);

    const result = await service.compareBookmark(
      userId,
      latitude,
      longitude,
      mockClient as Socket,
    );

    expect(mockGeoService.getNearbyBookmarkP).toHaveBeenCalledWith(
      latitude,
      longitude,
    );
    expect(mockDirectionGateway.sendPopup).not.toHaveBeenCalled();
    expect(result).toEqual({ triggered: false });
  });
});

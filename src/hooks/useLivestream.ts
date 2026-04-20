import { livestreamService } from '@/services/livestream.service';

export const useLivestream = () => {
  return {
    getLivestreams: livestreamService.getCurrent,
    getPublicCurrent: livestreamService.getPublicCurrent,
    getCurrentLivestream: livestreamService.getCurrent,
    getStreamHistory: livestreamService.getHistory,
    createLivestream: livestreamService.create,
    updateLivestream: livestreamService.update,
    endLivestream: livestreamService.end,
    getChatMessages: livestreamService.getChat,
    deleteChatMessage: livestreamService.deleteChat,
    getViewers: livestreamService.getViewers,
    addViewer: livestreamService.addViewer,
    removeViewer: livestreamService.removeViewer,
    banViewer: livestreamService.banViewer,
    unbanViewer: livestreamService.unbanViewer,
    getStreamStats: livestreamService.getStats,
    bulkViewerAction: livestreamService.bulkViewerAction,
  };
};

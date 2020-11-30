export type IBusBlockDataType = {
  CHAT_REQUEST;
  CHAT_RESPONSE;
  VIDEO_REQUEST;
  VIDEO_RESPONSE;
};

export type IBusDataBlock = {
  type: IBusBlockDataType;
  payload: ArrayBuffer;
};

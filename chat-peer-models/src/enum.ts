export enum MsgTypes {
  LOGIN, // 登录
  LOGOUT, // 登出
  TRANSFER, // 转发
  ADDRESS_TABLE, // 地址表
  BRIDGE, // 桥接
  BUSINESS, // 业务数据 通过主通道
}

export enum DataBlockType {
  OFFER,
  ANSWER,
  CANDIDATE,
  WRITTEN_WORDS,
}

export enum MsgTypes {
  LOGIN, // 登录
  LOGOUT, // 登出
  TRANSFER, // 转发
  SERVICE_PEER_TABLE, // 获取服务器在线用户的地址表
  ADDRESS_TABLE, // 地址表
  BRIDGE, // 桥接
  BUSINESS, // 业务数据 通过主通道
  BUSINESS_BEFORE, // 处理开始业务之前的业务逻辑
}

export enum DataBlockType {
  OFFER,
  ANSWER,
  CANDIDATE,
}

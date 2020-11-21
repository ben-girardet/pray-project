export interface Share {
  userId?: string;
  encryptedContentKey?: string;
  encryptedBy?: string;
  role?: string;
}

export interface MyShare {
  myShare?: Share;
}

export interface WithShares {
  myShare?: Share;
  shares?: Share[];
}
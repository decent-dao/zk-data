import { PrefixedHex } from './client-utils';

export const DOMAIN: EIP712Domain = {
    name: 'nym',
    version: '1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
    salt: '0x1f62937a3189e37c79aea1c4a1fcd5a56395069b1f973cc4d2218c3b65a6c9ff',
  };
  export type EIP712Domain = {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: PrefixedHex;
    salt: PrefixedHex;
  };
  
  export type EIP712Types = {
    [key: string]: { name: string; type: string }[];
  };
  
  export type EIP712Value = {
    [key: string]: string | number;
  };

  export type Content = {
    venue: string;
    title: string;
    body: string;
    parentId: PrefixedHex;
    groupRoot: PrefixedHex;
    timestamp: number;
  };
  

  export const CONTENT_MESSAGE_TYPES = {
    Post: [
      { name: 'venue', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'body', type: 'string' },
      { name: 'parentId', type: 'string' },
      { name: 'groupRoot', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
    ],
  };
  
export type EIP712TypedData = {
    domain: EIP712Domain;
    types: EIP712Types;
    value: EIP712Value;
  };
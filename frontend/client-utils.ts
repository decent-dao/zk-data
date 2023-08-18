import axiosBase from 'axios';
import { CONTENT_MESSAGE_TYPES, Content, DOMAIN, EIP712Domain, EIP712TypedData, EIP712Types, EIP712Value } from './types';
import { fromRpcSig, ecrecover } from '@ethereumjs/util';
import { hashTypedData } from 'viem';
export type PrefixedHex = `0x${string}`;

export const axios = axiosBase.create({
  baseURL: `/api/v1`,
});

type Member = {
  pubkey: string;
  path: string[];
  indices: number[];
};

export const getLatestGroup = async () => {
  const { data } = await axios.get('/groups/latest');

  const group: {
    root: PrefixedHex;
    members: Member[];
  } = data;

  return group;
};

export const eip712MsgHash = (
    domain: EIP712Domain,
    types: EIP712Types,
    value: EIP712Value,
  ) => {
    const hash = hashTypedData({
      domain,
      types,
      primaryType: Object.keys(types)[0],
      message: value,
    });
    return Buffer.from(hash.replace('0x', ''), 'hex');
  }

export const toTypedContent = (content: Content): EIP712TypedData => ({
    domain: DOMAIN,
    types: CONTENT_MESSAGE_TYPES,
    value: content,
  });

  export const getPubKeyFromEIP712Sig = (typedData: EIP712TypedData, sig: string): string => {
    const { v, r, s } = fromRpcSig(sig);
    return `${ecrecover(
      eip712MsgHash(typedData.domain, typedData.types, typedData.value),
      v,
      r,
      s,
    ).toString('hex')}`;
  };
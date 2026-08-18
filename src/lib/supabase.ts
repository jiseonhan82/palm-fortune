// Supabase 클라이언트 — 커플 궁합 기능 전용 (이 기능만 백엔드가 필요함).
// URL/anon key는 공개돼도 안전하도록 설계된 값(RLS로 접근 제어). 그래도 .env로 분리해
// 저장소에 직접 커밋되지 않게 관리합니다 (supabase/schema.sql 참고).
//
// 환경변수가 없으면(로컬 셋업 전 등) supabase는 null — 커플 기능 진입점에서
// isCoupleFeatureAvailable()로 체크해 조용히 숨기거나 안내 문구를 보여주세요.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CoupleInvite } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export function isCoupleFeatureAvailable(): boolean {
  return supabase !== null;
}

interface InviteRow {
  id: string;
  inviter_seed: string;
  inviter_rare_name: string | null;
  inviter_rare_emoji: string | null;
  partner_seed: string | null;
  partner_rare_name: string | null;
  partner_rare_emoji: string | null;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at: string | null;
}

function fromRow(row: InviteRow): CoupleInvite {
  return {
    id: row.id,
    inviterSeed: row.inviter_seed,
    inviterRareName: row.inviter_rare_name,
    inviterRareEmoji: row.inviter_rare_emoji,
    partnerSeed: row.partner_seed,
    partnerRareName: row.partner_rare_name,
    partnerRareEmoji: row.partner_rare_emoji,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

/** 초대 생성 (결제 성공 직후 호출). 실패 시 null. */
export async function createCoupleInvite(params: {
  inviterSeed: string;
  inviterRareName: string;
  inviterRareEmoji: string;
}): Promise<CoupleInvite | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('couple_invites')
    .insert({
      inviter_seed: params.inviterSeed,
      inviter_rare_name: params.inviterRareName,
      inviter_rare_emoji: params.inviterRareEmoji,
    })
    .select()
    .single();
  if (error || !data) return null;
  return fromRow(data as InviteRow);
}

/** id로 초대 조회 (초대자의 대기 화면 폴링, 파트너의 랜딩 화면 진입 시 사용) */
export async function fetchCoupleInvite(id: string): Promise<CoupleInvite | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('couple_invites').select().eq('id', id).single();
  if (error || !data) return null;
  return fromRow(data as InviteRow);
}

/** 파트너가 자기 손금을 찍은 뒤 참여 (pending 상태에서만 성공) */
export async function joinCoupleInvite(
  id: string,
  params: { partnerSeed: string; partnerRareName: string; partnerRareEmoji: string },
): Promise<CoupleInvite | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('couple_invites')
    .update({
      partner_seed: params.partnerSeed,
      partner_rare_name: params.partnerRareName,
      partner_rare_emoji: params.partnerRareEmoji,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending') // 이미 참여된 초대에 덮어쓰기 방지
    .select()
    .single();
  if (error || !data) return null;
  return fromRow(data as InviteRow);
}

-- 커플 궁합 리포트용 스키마.
-- Supabase 콘솔 → SQL Editor에 붙여넣고 실행하세요.
--
-- 설계 원칙:
-- - 손바닥 "사진 원본"은 저장하지 않음. 클라이언트에서 로컬로 계산한 시드(해시)만 저장.
-- - 인증(로그인) 없이 동작 — 초대 링크의 id(uuid)를 아는 사람만 접근 가능한 "비밀 URL" 방식.
--   실명/로그인 기반 인증이 아니므로, 링크가 유출되면 제3자가 참여할 수 있음(재미 목적 MVP 수준의 신뢰 모델).
-- - 소모성 결제(IAP)는 초대자 쪽 기기에서만 발생 — 이 테이블은 결제 자체와 무관하고,
--   "결과를 볼 수 있는 자격"만 앱의 storage.ts(hasEntitlement)가 로컬에서 관리.

create table if not exists couple_invites (
  id uuid primary key default gen_random_uuid(),

  -- 초대자(나) 정보
  inviter_seed text not null,               -- 내 손금 시드(원본 사진 아님, 해시 문자열)
  inviter_rare_name text,                   -- 화면 표시용: 내 희귀 문양 이름 (선택, 없어도 됨)
  inviter_rare_emoji text,

  -- 참여자(상대방) 정보 — 참여 전엔 전부 null
  partner_seed text,
  partner_rare_name text,
  partner_rare_emoji text,

  status text not null default 'pending' check (status in ('pending', 'completed')),

  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- 오래된 미완료 초대 정리용 인덱스 (수동 정리 또는 추후 cron에 활용)
create index if not exists idx_couple_invites_created_at on couple_invites (created_at);

alter table couple_invites enable row level security;

-- 누구나 새 초대를 만들 수 있음 (초대자가 결제 후 호출)
drop policy if exists "anyone can create invite" on couple_invites;
create policy "anyone can create invite"
  on couple_invites for insert
  with check (true);

-- 누구나 id를 알면 조회 가능 (초대 링크 = 비밀 URL)
drop policy if exists "anyone can read by id" on couple_invites;
create policy "anyone can read by id"
  on couple_invites for select
  using (true);

-- pending 상태인 초대에만, 참여(업데이트)를 허용
drop policy if exists "anyone can join pending invite" on couple_invites;
create policy "anyone can join pending invite"
  on couple_invites for update
  using (status = 'pending')
  with check (true);

-- 수동 순위 컬럼 제거 (OVR 기준 정렬로 변경)

alter table members drop column if exists rank;

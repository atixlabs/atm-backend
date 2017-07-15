# !/bin/bash

pkill -f testrpc;
testrpc --debug -l="0x6DB8057280"  --account="0x424525f3f6def569df3d97b0d06238e776f2670c853f32c5c029c1622403b8f2,100000000000000000000000000000000000000" -u 0 &
sleep 5;
truffle migrate
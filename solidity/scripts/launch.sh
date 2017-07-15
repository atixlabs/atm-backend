# !/bin/bash

pkill -f testrpc;
testrpc -l="0x6DB8057280"  --account="0xe739110e10b8e71b300687bb89fe1da667e6d6d775c59244994b2c6a4bd0cf04,100000000000000000000000000000000000000" -u 0 &
sleep 5;
truffle migrate
import {
  TransferEvents
} from '../api/transfer_events';
import {
  get_historic_events,
  watch_events
} from './blockchain_tools';

function process_log(err, log) {
  if (log.event === "Transfer" && log.type == "mined") {
    console.log("Processing log", log);

    const {
      from,
      to,
      value
    } = log.args

    TransferEvents.upsert({
      _id: log.transactionHash
    }, {
      from,
      to,
      value: value.toString(),
      blockNumber: log.blockNumber
    })
  }
}

export function watch_chain() {
  var latest = TransferEvents.findOne({}, {
    sort: {
      blockNumber: -1
    }
  });

  get_historic_events(latest ? (latest.blockNumber + 1) : 0, "latest", (err, logs) => logs.forEach(log => process_log(null, log)));
  watch_events(process_log);

}
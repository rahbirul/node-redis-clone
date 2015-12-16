# Node Redis Clone

A TCP server written in Node.js that supports a subset of the [Redis Protocol](http://redis.io/topics/protocol). Compliant with the `redis-cli`.

## Getting set up

Developed on Node 4.1.1, but should be compliant with less recent versions.

1. `cd` into the project directory
2. Install dependencies: `npm install`
3. Run the server: `node server.js <port>` (default is 6379)
4. Run Redis client: `redis-cli -p <port>` (default is 6379)
5. Start sending commands to the server using the Redis client

## Supported operations

1. `GET key`
2. `SET key value`
3. `EXISTS key`
4. `DELETE key [key...]`
5. `INCR` key (atomicity at concurrent access is not guaranteed)
6. `DECR` key (atomicity at concurrent access is not guaranteed)

## TODOs

1. Persist data between server restarts/crashes.
2. Efficient (and more elegant) parsing of command inputs
3. Support More operations
4. Write tests
5. Atomic operations

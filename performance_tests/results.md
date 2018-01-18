# Benchmark results

## ptusch
### Client Machine
* CPU: Intel(R) Core(TM) i7-6600U CPU @ 2.60GHz
* Cores/Threads: 2/4
* Memory: 16GB

### Client Machine
* CPU: Intel(R) Core(TM) i7-6600U CPU @ 2.60GHz
* Cores/Threads: 2/4
* Memory: 16GB

* The server ran on the client machine within a docker container based on [dinkel/openldap](https://github.com/dinkel/docker-openldap)
* OS: Linux 4.14.13-1

### Testresults for 100 iterations with each 100 function calls:
```plain
Running ldapjs for 100 iterations and 100 entries:
## add ##
sum:     100.09594829099998 s
slowest: 4.464414737 s
fastest: 0.370420826 s
average: 1.00095948291 s
## compare ##
sum:     17.916895461 s
slowest: 0.39322231 s
fastest: 0.147213344 s
average: 0.17916895461 s
## modify ##
sum:     28.084891847 s
slowest: 0.512405471 s
fastest: 0.242033712 s
average: 0.28084891847000004 s
## search ##
sum:     27.365740813000002 s
slowest: 0.315547423 s
fastest: 0.250567394 s
average: 0.27365740813 s
## delete ##
sum:     125.67732693299995 s
slowest: 4.370289219 s
fastest: 0.444104143 s
average: 1.2567732693299996 s


Running openldapjs for 100 iterations and 100 entries:
## add ##
sum:     68.30573914100002 s
slowest: 4.17422926 s
fastest: 0.339167228 s
average: 0.6830573914100002 s
## compare ##
sum:     14.212111806 s
slowest: 0.336601216 s
fastest: 0.11787834 s
average: 0.14212111806 s
## modify ##
sum:     26.839640095999993 s
slowest: 1.278275454 s
fastest: 0.222493845 s
average: 0.26839640095999995 s
## search ##
sum:     23.259908248000002 s
slowest: 0.394967592 s
fastest: 0.190570533 s
average: 0.23259908248000002 s
## delete ##
sum:     82.50075322300002 s
slowest: 3.793282758 s
fastest: 0.334937755 s
average: 0.8250075322300002 s
```

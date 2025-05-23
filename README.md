# Overview
This static website demonstrates busy beaver game with 1,2,3 and 4 state Turing machines.

[Here](https://ttcpavle.github.io/Busy-Beaver-Game/) you can test this game interactivly. Game is explained below.

## Turing machines

**What is Turing machine?**
*A Turing machine is a mathematical model of computation describing an abstract machine that manipulates symbols on a strip of tape according to a table of rules. Despite the model's simplicity, it is capable of implementing any computer algorithm.*

**How does it operate?**
*The machine operates on an infinite memory tape divided into discrete cells, each of which can hold a single symbol drawn from a finite set of symbols called the alphabet of the machine. It has a "head" that, at any point in the machine's operation, is positioned over one of these cells, and a "state" selected from a finite set of states. At each step of its operation, the head reads the symbol in its cell. Then, based on the symbol and the machine's own present state, the machine writes a symbol into the same cell, and moves the head one step to the left or the right, or halts the computation.*

 *The choice of which replacement symbol to write, which direction to move the head, and whether to halt is based on a finite table that specifies what to do for each combination of the current state and the symbol that is read. As with a real computer program, it is possible for a Turing machine to go into an infinite loop which will never halt.*

**Formal definition**
Turing machine can be formally defined as 7-tuple $M= \langle Q, \Gamma, b, \Sigma, \delta, q_{0}, F\rangle$ where:
* $\Gamma$ is a finite, non-empty set of tape alphabet symbols
* $b \in \Gamma$  is the blank symbol (the only symbol allowed to occur on the tape infinitely often at any step during the computation);
* $\Sigma \subseteq \Gamma \setminus \{b\}$ is the set of input symbols, that is, the set of symbols allowed to appear in the initial tape contents
* $Q$ is finite, non-empty set of states
* $q_{0} \in Q$ is initial state
* $F \subseteq Q$ is the set of final states or accepting states. The initial tape contents is said to be accepted by M if it eventually halts in a state from F
* $\delta : (Q \setminus F) \times \Gamma \to Q \times G \times \{L, R\}$ is a partial function called the transition function, where L is left shift, R is right shift. If $\delta$ is not defined on the current state and the current tape symbol, then the machine halts; intuitively, the transition function specifies the next state transited from the current state, which symbol to overwrite the current symbol pointed by the head, and the next head movement.

In simpler words, this delta functions takes current state and input symbol and defines next state, symbol to write and left or right shift on tape.

## What is Busy Beaver game?

*In theoretical computer science, the busy beaver game aims to find a terminating program of a given size that (depending on definition) either produces the most output possible, or runs for the longest number of steps. Since an endlessly looping program producing infinite output or running for infinite time is easily conceived, such programs are excluded from the game. Rather than traditional programming languages, the programs used in the game are n-state Turing machines, one of the first mathematical models of computation.*

An n-th busy beaver, BB-n or simply "busy beaver" is a Turing machine that wins the n-state busy beaver game. Depending on definition, it either attains the highest score (denoted by $\Sigma (n)$), or runs for the longest time ($S(n)$), among all other possible n-state competing Turing machines.

**Formal definition**
The n-state busy beaver game involves a class of Turing machines, each member of which is required to meet the following:

* The machine has n operational states + Halt state where n is a positive integer and one of n states is starting state
* The machine uses single two-way infinite tape
* The tape alphabet is {0, 1} with 0 serving as the blank symbol
* Machine's transition functions takes 2 inuts: 
1) current non-halt state
2) symbol in the current tape cell

and produces outputs:
1) a symbol to write over the symbol in current tape cell
2) a direction to move (left/right)
3) a state to transition into (may be halting state)

If, and only if, the machine eventually halts, then the number of 1s finally remaining on the tape is called the machine's score. The n-state busy beaver (BB-n) game is therefore a contest, depending on definition to find such an n-state Turing machine having the largest possible score or running time.

This is example for 4-state busy beaver:

<table>
  <tr><th> </th><th>A</th><th>B</th><th>C</th><th>D</th></tr>
  <tr><td>0</td><td>1RB</td><td>1LA</td><td>1RH</td><td>1RD</td></tr>
  <tr><td>1</td><td>1LB</td><td>0LC</td><td>1LD</td><td>0RA</td></tr>
</table>
Other busy beaver tables can be found on wikipedia.

**July 2-nd 2024**
*We are extremely happy to announce that, after two years of intense collaboration, the goal of the Busy Beaver Challenge 1.6k has been reached: the conjecture “BB(5) 501 = 47,176,870” is proved...* from: [busy beaver discussion](https://discuss.bbchallenge.org/t/july-2nd-2024-we-have-proved-bb-5-47-176-870/237)
## Sources and additional information

**Sources for this readme file**
* Wikipedia Turing machines: https://en.wikipedia.org/wiki/Turing_machine
* Wikipedia Busy Beaver: https://en.wikipedia.org/wiki/Busy_beaver

**Cool video explainations**
* Computerphile video on busy beaver game: https://youtu.be/CE8UhcyJS0I?si=1JqKRIdC_oltYKE-
* The boundary of computation (must watch, very interesting): https://youtu.be/kmAc1nDizu0?si=72j_R9Fasn2yc-55
* Quanta magazine on 5-th busy beaver: https://www.quantamagazine.org/amateur-mathematicians-find-fifth-busy-beaver-turing-machine-20240702/

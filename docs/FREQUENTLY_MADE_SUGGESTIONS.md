This is a list of frequently made suggestions. Broad categories are:
- Already being worked on
- Will add if possible
- Maybe with consideration
- Cannot be done
- Will not be done

### Parity

#### Attack animations: Desired but will not add for now
This is one of the features that we really want, but the  maintenance cost of current "best" method is too high, as it requires us to add attachments for every single items.

#### Ability to use items in Offhand: Not from this add-on
Adding Offhand support for mobile users is very tricky. It is simply not possible for us to implement it in a way that everyone would like.

Mojang developers are considering implementation of Offhand support. But it hasn't been fully planned yet. According to one of the Mojangsters in Bedrock Add-Ons Discord server:
>"This is just very early investigations into the problem space and needs to prepare for planning. Nothing being worked on yet."
>— Anjku

#### Holding interact (right-click) for shield: No
Shield in Java Edition requires holding interact to use, while Bedrock Edition uses sneaking. The reason why Bedrock uses sneaking is mainly due to the environment that many players are in: Touchscreen.
  - For Tap-to-Interact, holding interact is not feasible in this control scheme.
  - For Action Buttons, it can be overwhelming since touchscreen control does not have as much freedom as other control methods.

#### Sweeping Edge enchantment: Yes but will not add for now
This is very desired, but unless Bedrock gets official custom enchantment, it will not be added. Until then, all the sweep attacks will have Sweeping Edge I property by default.

#### Techniques from JE in general: No
Many techniques from Java Edition are mainly exploits of system, one of them being "Attribute Swapping". Most of player actions in Java Edition are client authoritative, and player's attack damage is dictated by what player is holding. However, Bedrock does not do this. Attacking and swapping at the same tick will cause the game to force swap player's selected slot to previous one and void the attack.

On top of that, the add-on works by directly getting data-driven stats of an item from memory, which wouldn't work well.


### Other Things

#### AppleSkin: Being worked on
The add-on has Saturation Healing feature. Due to the nature of this add-on, other AppleSkin add-on generally causes conflict and does not work, so we decided to make our own.
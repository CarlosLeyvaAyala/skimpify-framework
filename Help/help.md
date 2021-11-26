# Overview

We all love armors with skimpy or damaged variants, but there's no other way than to equip them manually to simulate things happening while playing... until now.

This framework enables modders to make mods that automatically swap and restore those variants, so the player can concentrate on what really matters: playing.

It works for both men and women... at least theoretically, since I don't know about male armors that have these kind of variants.

This framework is the result of an idea that have been floating around my mind for many years, but that it wasn't really feasible because of Papyrus' hilarious slowness and sorry clunkiness.

It's just now that Skyrim Platform exists that this idea can finally come true.

# Change Relationships

You will see the words _Change Relationship_ quite a lot both here and the API documentation.
Here's an explanation of what that means.

Some armors have damaged versions, others are more like nip/pussy slips and yet others are armor variants with missing parts (but not damaged per se).
A _Change Relationship_ tells precisely that: what happens when an armor changes to another.

These relationships exist because you may want to know what happens when you change an armor for other.
This framework was born from the necessity of managing armor changes for my [Wardrobe Malfunction][] mod. It wouldn't make sense to break an armor on sneaking, then automatically restore it when after exiting sneaking; something that can be reasonable done for a nipslip, for example.

Now we will see each type of _Change Relationship_ there is and some pictures, because all this stuff is is easier to explain with pictures.

## `slip`

The new `Armor` is basically the same, but moved/open to be revealing.

An unbuttoned bra or open shirt is a good candidate to be registered as this type.

![](img/slip1_a.jpg)
![](img/slip1_b.jpg)

![](img/slip2_a.jpg)
![](img/slip2_b.jpg)

![](img/slip3_a.jpg)
![](img/slip3_b.jpg)

... you get the idea...

This is the most subtle kind of change and one that can be done periodically with no _muh immersion_ repercusions.

[Wardrobe Malfunction][] uses these for slips while sneaking, when sprinting, when swimming...these can be used quite liberally and players won't complain.
Restoring the armor back to normal means an `Actor` just adjusted their clothes.

## `change`

The `Armor` has structural changes, like missing parts.

![](img/change1_a.jpg)
![](img/change1_b.jpg)

Notice how the armor isn't really broken or damaged; it's just that it has some missing parts; both for the skirt and cuirass.

[Wardrobe Malfunction][] uses this kind of _Change Relationship_ to **represent** (at some point you just need to use your imagination) parts of the armor falling in the heat of the battle.

When a malfunction of this type happens, that mod doesn't restore it right away, but waits some seconds only after some conditions are met.
That is meant to represent an `Actor` losing pieces of armor and then putting them back **only when possible**.

This is the most common variant found on armors, by the way. That's why everything, from [automatic generation][AutoGen] to improperly registered _Change Relationships_ default to this value.

## `damage`

The `Armor` has structural changes that makes it look damaged or worn out.

![](img/damage1_a.jpg)
![](img/damage1_b.jpg)

![](img/damage2_a.jpg)
![](img/damage2_b.jpg)

Once again, [Wardrobe Malfunction][] uses these kind of _Change Relationships_ to break armors in combat.
You can use these for some rape scene I know you will totally use this framework for, you predictable bastard[^Rape].

[^Rape]: In fact, I could wager the first mod to use this framework after Wardrobe Malfunction will be some kind of rape or slavery mod.

By its nature, obviously this kind of change shouldn't be automatically restored by your mod, otherwise it
will just look dumb.
That's unless you add an armor repair mechanic, of course.

The aformented [Wardrobe Malfunction][] never restores these kind of changes for _muh immersion_ purposes.

[Wardrobe Malfunction]: todo
[AutoGen]: tede

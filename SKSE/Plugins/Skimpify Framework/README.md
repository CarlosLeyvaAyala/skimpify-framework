##  Readme

This folder contains definitions made by myself (and hopefully, definitions made by other people) so you can just start to use any mod that requires the _Skimpify Framework_.

Most of these I can't really remember where I downloaded them from, so if you find out the framework "isn't working" the most likely culprit is one of these files, since **they are dependant on the version of the mod you are using**.

# File contents

All these files are in json format, so **you can read and manually modify them** with whatever text editor you like.

Inside these files, armors are referred to by using the mod esp file name and its FormID in hexadecimal notation:

```json
"[SunJeong] Ninirim Collection.esp|11ed3c": {
  "name": "Red Nose Upper Slutty",
  "next": "[SunJeong] Ninirim Collection.esp|123e40",
  "nextN": "Red Nose Just Bones",
  "nextT": "change",
  "prev": "[SunJeong] Ninirim Collection.esp|119c2d",
  "prevN": "Red Nose Upper",
  "prevT": "slip"
}
```

All name fields (`"name"`, `nextN` and `prevN`) are there so we humans know which armor the entry refers to when we make manual changes.\
The framework doesn't need it and it is discarded, so there's no problem if you use patches that rename your armors (you may have noticed some of my armors were renamed, in fact).

## Kind of incompatibilities
In general, anytime
This means, if some version changes FormIDs for any armor (like an esl)

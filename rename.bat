@echo off
set /a x=%1
set mypath=%2
  echo %mypath%

setlocal enableDelayedExpansion
for %%F in (%mypath%\*) do (
  echo %%F
  echo %x%.png
  ren "%%F" "!x!.png"
  set /a x+=1
)
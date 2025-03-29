{pkgs}: {
  deps = [
    pkgs.xorg.libXrandr
    pkgs.xorg.libXrender
    pkgs.xorg.libXi
    pkgs.xorg.libXext
    pkgs.xorg.libX11
    pkgs.alsa-lib
    pkgs.mesa
    pkgs.gtk3
    pkgs.cups
    pkgs.at-spi2-atk
    pkgs.atk
    pkgs.dbus
    pkgs.nspr
    pkgs.nss
    pkgs.firefox
    pkgs.glib
    pkgs.imagemagick
    pkgs.chromium
    pkgs.unzip
    pkgs.jq
    pkgs.ffmpeg
    pkgs.postgresql
    pkgs.lsof
  ];
}

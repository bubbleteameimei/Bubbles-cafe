{pkgs}: {
  deps = [
    pkgs.xorg.libX11
    pkgs.cups
    pkgs.at-spi2-atk
    pkgs.dbus
    pkgs.nspr
    pkgs.nss
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

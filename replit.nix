{pkgs}: {
  deps = [
    pkgs.chromium
    pkgs.unzip
    pkgs.jq
    pkgs.ffmpeg
    pkgs.postgresql
    pkgs.lsof
  ];
}

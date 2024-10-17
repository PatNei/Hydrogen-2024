{ pkgs, lib, config, inputs, ... }:
let
  unstable = import inputs.unstable { system = pkgs.stdenv.system; };
in
{
  # https://devenv.sh/basics/
  env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = [ 
    pkgs.git
    unstable.shopify-cli
    pkgs.nix-ld
    pkgs.xdg-utils # NEEDS TO BE AVAILABLE TO SHOPIFY

   ];
  # dotenv.enable = true;
  # https://devenv.sh/languages/
  # languages.rust.enable = true;
  languages.javascript.enable = true;
  languages.typescript.enable = true;
  languages.javascript.npm.enable = true;
  languages.javascript.bun.enable = true;
  
  # https://devenv.sh/processes/
  # processes.cargo-watch.exec = "cargo-watch";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  scripts.hello.exec = ''
    echo hello from $GREET
  '';

  enterShell = ''
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}

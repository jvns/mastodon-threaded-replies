curl https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.0/tailwindcss-linux-x64 -sLO
chmod +x tailwindcss-linux-x64
mv tailwindcss-linux-x64 tailwindcss
./tailwindcss --content  '*.html,*.js' -o lib/tailwind.min.css
rm tailwindcss

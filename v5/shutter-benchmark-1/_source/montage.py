import sys,glob
from PIL import Image,ImageDraw
files=sys.argv[3:] ; out=sys.argv[1]; cols=int(sys.argv[2])
ims=[Image.open(f).convert('RGB') for f in files]
w=480 if ims[0].width>ims[0].height else 200
th=[im.resize((w,int(im.height*w/im.width))) for im in ims]
h=th[0].height; rows=(len(th)+cols-1)//cols
M=Image.new('RGB',(cols*(w+6)+6,rows*(h+24)+6),(20,20,20));d=ImageDraw.Draw(M)
for i,(im,f) in enumerate(zip(th,files)):
    x=6+(i%cols)*(w+6);y=6+(i//cols)*(h+24);M.paste(im,(x,y+18));d.text((x,y+2),f.split('/')[-1],fill=(230,230,230))
M.save(out)

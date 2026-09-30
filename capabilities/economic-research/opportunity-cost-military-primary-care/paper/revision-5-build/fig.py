import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
plt.rcParams['font.family']='DejaVu Sans'
yrs=['2027','2028','2029','2030']; navy=[276966,276966,282585,282585]; civ=[459057]*4
cum=[173420,338582,491025,636209]
NAVY='#23628B'; ORG='#C98241'; PUR='#6B4E8E'; INK='#1B2A38'; GRID='#E3E6EA'
fig=plt.figure(figsize=(11,6.4),dpi=200)
fig.text(0.06,0.93,'Internal medicine in San Diego',fontsize=18,fontweight='bold',color=INK)
fig.text(0.06,0.885,'Illustrative Navy O-4 versus published local benchmark | Constant 2026 dollars',fontsize=10.5,color=INK)
k=FuncFormatter(lambda v,p:f'${v/1000:.0f}k')
ax1=fig.add_axes([0.10,0.30,0.37,0.48]); ax2=fig.add_axes([0.57,0.30,0.37,0.48])
fig.text(0.06,0.81,'A  Annual gross cash',fontsize=12,fontweight='bold',color=INK)
fig.text(0.53,0.81,'B  Cumulative discounted cash gap',fontsize=12,fontweight='bold',color=INK)
import numpy as np; x=np.arange(4); w=0.27
ax1.bar(x-w/2-0.02,navy,w,color=NAVY,label=r'Navy: \$276,966 to \$282,585')
ax1.bar(x+w/2+0.02,civ,w,color=ORG,label=r'Marit all-employer average: \$459,057')
ax1.set_ylim(0,500000); ax1.set_yticks(range(0,500001,100000))
ax2.plot(yrs,cum,color=PUR,lw=2.2,marker='s',ms=5)
ax2.set_ylim(0,700000); ax2.set_yticks(range(0,700001,140000))
ax2.text(1.9,640000,'$636,209',fontsize=13,fontweight='bold',color=PUR,ha='center')
ax2.text(1.9,595000,'Four-year PV',fontsize=10,color=INK,ha='center')
for a in (ax1,ax2):
    a.yaxis.set_major_formatter(k); a.grid(axis='y',color=GRID); a.set_axisbelow(True)
    for s in ('top','right'): a.spines[s].set_visible(False)
    a.spines['left'].set_color('#9AA3AD'); a.spines['bottom'].set_color('#9AA3AD')
    a.tick_params(colors=INK,labelsize=9.5,length=0)
ax1.set_xticks(x); ax1.set_xticklabels(yrs)
ax1.legend(loc='upper left',bbox_to_anchor=(-0.02,-0.08),frameon=False,fontsize=10,handlelength=1.2)
fig.text(0.57,0.215,'5% real discount rate; year-end payments',fontsize=10,color=INK)
fig.text(0.57,0.175,'Gross cash only: excludes pension, taxes, and other benefits',fontsize=10,color=INK)
fig.text(0.06,0.06,'Navy: O-4, over-10 years of service, with dependents, ZIP 92134; conditional $48,000 annual retention bonus.',fontsize=9,color=INK)
fig.text(0.06,0.025,'Sources: DFAS (2026a, 2026b, 2026c); Defense Travel Management Office BAH lookup; Marit Health (April 2026). Not a matched civilian offer.',fontsize=9,color=INK)
fig.savefig('figure1.png',dpi=200,facecolor='white')

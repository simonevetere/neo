from googlesearch import search

def get(keywords):
    info = ""
    for i in search(keywords, advanced=True):
        info = info + str(i)

    return info

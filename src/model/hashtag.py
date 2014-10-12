

def filter_hashtags(str_):
    return {tag.strip("#") for tag in str_.split() if tag.startswith("#")}
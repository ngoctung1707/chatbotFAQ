from enum import Enum


class PageType(str, Enum):
    NEWS = "news"
    COURSE = "course"
    SOLUTION = "solution"
    RESEARCH_LAB = "research_lab"
    STATIC = "static"


class Collection(str, Enum):
    NEWS = "news"
    COURSES = "courses"
    SOLUTIONS = "solutions"
    RESEARCH_LABS = "research-labs"
    STATIC = "static"
